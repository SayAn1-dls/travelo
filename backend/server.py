from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Header, Depends, UploadFile, File, Form, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hmac
import hashlib
import uuid
import asyncio
import logging
import json
import httpx
import razorpay
import requests
import resend
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------- Mongo & App ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Travelo API")
api = APIRouter(prefix="/api")

# ---------- Razorpay ----------
RZP_KEY_ID = os.environ.get("RAZORPAY_KEY_ID", "rzp_test_placeholder_key")
RZP_KEY_SECRET = os.environ.get("RAZORPAY_KEY_SECRET", "placeholder_secret")
GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY", "placeholder_google_maps_key")
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "re_placeholder_key")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
FROM_NAME = os.environ.get("FROM_NAME", "Travelo")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
APP_NAME = os.environ.get("APP_NAME", "travelo")

RZP_IS_LIVE = not RZP_KEY_ID.startswith("rzp_test_placeholder") and not RZP_KEY_SECRET.startswith("placeholder")
MAPS_IS_LIVE = not GOOGLE_MAPS_API_KEY.startswith("placeholder")
RESEND_IS_LIVE = not RESEND_API_KEY.startswith("re_placeholder")

rzp_client = None
if RZP_IS_LIVE:
    rzp_client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET))

if RESEND_IS_LIVE:
    resend.api_key = RESEND_API_KEY

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

# ---------- Emergent Object Storage (with local fallback) ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
storage_key: Optional[str] = None
LOCAL_UPLOADS_DIR = ROOT_DIR / "uploads"
LOCAL_UPLOADS_DIR.mkdir(exist_ok=True)

def init_storage() -> Optional[str]:
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_LLM_KEY:
        return None
    try:
        r = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=15)
        r.raise_for_status()
        storage_key = r.json()["storage_key"]
        return storage_key
    except Exception as e:
        logging.info(f"Remote storage not available, using local fallback ({e})")
        return None

def put_object_sync(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if key:
        try:
            r = requests.put(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key, "Content-Type": content_type},
                data=data,
                timeout=120,
            )
            r.raise_for_status()
            return r.json()
        except Exception as e:
            logging.warning(f"Remote storage PUT failed, falling back local: {e}")
    # local fallback
    full = LOCAL_UPLOADS_DIR / path
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_bytes(data)
    meta = LOCAL_UPLOADS_DIR / (path + ".ctype")
    meta.parent.mkdir(parents=True, exist_ok=True)
    meta.write_text(content_type)
    return {"path": path, "size": len(data), "etag": "local"}

def get_object_sync(path: str):
    key = init_storage()
    if key:
        try:
            r = requests.get(
                f"{STORAGE_URL}/objects/{path}",
                headers={"X-Storage-Key": key},
                timeout=60,
            )
            r.raise_for_status()
            return r.content, r.headers.get("Content-Type", "application/octet-stream")
        except Exception as e:
            logging.info(f"Remote storage GET missed, trying local ({e})")
    full = LOCAL_UPLOADS_DIR / path
    if not full.exists():
        raise HTTPException(status_code=404, detail="File not found")
    meta = LOCAL_UPLOADS_DIR / (path + ".ctype")
    ctype = meta.read_text().strip() if meta.exists() else "application/octet-stream"
    return full.read_bytes(), ctype

# ---------- Curated inventory ----------
DESTINATIONS = [
    {"slug": "goa",       "name": "Goa",       "country": "India",   "lat": 15.2993, "lng": 74.1240, "tagline": "Sun. Surf. Susegado.", "image": "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg"},
    {"slug": "jaipur",    "name": "Jaipur",    "country": "India",   "lat": 26.9124, "lng": 75.7873, "tagline": "The pink city of kings.", "image": "https://images.unsplash.com/photo-1757439402375-2f2a4ab0dc75"},
    {"slug": "manali",    "name": "Manali",    "country": "India",   "lat": 32.2432, "lng": 77.1892, "tagline": "Alpine peaks & pine forests.", "image": "https://images.pexels.com/photos/9629654/pexels-photo-9629654.jpeg"},
    {"slug": "bali",      "name": "Bali",      "country": "Indonesia","lat": -8.4095, "lng": 115.1889, "tagline": "Island of the gods.", "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg"},
    {"slug": "dubai",     "name": "Dubai",     "country": "UAE",     "lat": 25.2048, "lng": 55.2708, "tagline": "Skyline of tomorrow.", "image": "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4"},
    {"slug": "paris",     "name": "Paris",     "country": "France",  "lat": 48.8566, "lng": 2.3522,  "tagline": "City of eternal light.", "image": "https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg"},
]

HOTELS = [
    {"id": "htl_01", "destination": "goa", "name": "The Coral Vault", "rating": 4.8, "reviews": 1284, "price": 6499, "image": "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg", "amenities": ["Infinity Pool", "Sea View", "Spa", "Free Wifi"], "description": "A cliffside sanctuary overlooking Vagator with pool-facing suites."},
    {"id": "htl_02", "destination": "goa", "name": "Palm & Ember Resort", "rating": 4.6, "reviews": 903, "price": 4299, "image": "https://images.unsplash.com/photo-1757439402375-2f2a4ab0dc75", "amenities": ["Beachfront", "Pool", "Restaurant", "Bar"], "description": "Warm sands, cool cocktails, and rooms that open into the palms."},
    {"id": "htl_03", "destination": "jaipur", "name": "Amber Palace Suites", "rating": 4.9, "reviews": 2140, "price": 8999, "image": "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4", "amenities": ["Heritage", "Courtyard Pool", "Fine Dining", "Butler"], "description": "A restored haveli minutes from Hawa Mahal with heritage-grade suites."},
    {"id": "htl_04", "destination": "manali", "name": "Cedar Peak Lodge", "rating": 4.7, "reviews": 678, "price": 5299, "image": "https://images.pexels.com/photos/9629654/pexels-photo-9629654.jpeg", "amenities": ["Mountain View", "Fireplace", "Ski Access", "Hot Cocoa Bar"], "description": "Snow-capped views, cedarwood interiors and a slope-side firepit."},
    {"id": "htl_05", "destination": "bali", "name": "Ubud Jade Villas", "rating": 4.9, "reviews": 1750, "price": 12499, "image": "https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg", "amenities": ["Private Pool", "Jungle View", "Yoga Deck", "Chef"], "description": "Private pool villas hidden inside the emerald rice terraces of Ubud."},
    {"id": "htl_06", "destination": "dubai", "name": "Nova Marina Tower", "rating": 4.8, "reviews": 3210, "price": 15999, "image": "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg", "amenities": ["Marina View", "Rooftop Pool", "Michelin Dining", "Spa"], "description": "Panoramic Marina suites moments from JBR with sky-high infinity pool."},
    {"id": "htl_07", "destination": "paris", "name": "Le Rive Noir", "rating": 4.7, "reviews": 1400, "price": 18499, "image": "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4", "amenities": ["Eiffel View", "Boutique", "Wine Bar", "Concierge"], "description": "An atelier-style hotel on the Left Bank with Eiffel-facing balconies."},
    {"id": "htl_08", "destination": "manali", "name": "Solang Wood Retreat", "rating": 4.5, "reviews": 402, "price": 3799, "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg", "amenities": ["Riverside", "Bonfire", "Trekking", "Cafe"], "description": "Riverside cabins with bonfires under a canopy of Himalayan pines."},
]

CARS = [
    {"id": "car_01", "destination": "goa", "name": "Mahindra Thar Roxx", "type": "SUV", "seats": 4, "transmission": "Automatic", "price": 3499, "image": "https://images.pexels.com/photos/16189183/pexels-photo-16189183.jpeg", "features": ["4x4", "Sunroof", "Bluetooth", "AC"]},
    {"id": "car_02", "destination": "goa", "name": "Royal Enfield Meteor", "type": "Bike", "seats": 2, "transmission": "Manual", "price": 899, "image": "https://images.unsplash.com/photo-1774838231308-72e6792f7ab8", "features": ["Cruise Ready", "ABS", "Helmet Kit"]},
    {"id": "car_03", "destination": "jaipur", "name": "Toyota Innova Crysta", "type": "MPV", "seats": 7, "transmission": "Automatic", "price": 4299, "image": "https://images.pexels.com/photos/16189183/pexels-photo-16189183.jpeg", "features": ["Family Sized", "AC", "Airport Pickup", "Chauffeur"]},
    {"id": "car_04", "destination": "manali", "name": "Jeep Compass Trailhawk", "type": "SUV", "seats": 5, "transmission": "Automatic", "price": 5299, "image": "https://images.unsplash.com/photo-1774838231308-72e6792f7ab8", "features": ["Snow Mode", "4x4", "Roof Rack"]},
    {"id": "car_05", "destination": "bali", "name": "Vespa Primavera", "type": "Scooter", "seats": 2, "transmission": "Automatic", "price": 799, "image": "https://images.pexels.com/photos/16189183/pexels-photo-16189183.jpeg", "features": ["Beach Ready", "Helmet", "USB Charger"]},
    {"id": "car_06", "destination": "dubai", "name": "Lamborghini Urus", "type": "Luxury SUV", "seats": 4, "transmission": "Automatic", "price": 39999, "image": "https://images.pexels.com/photos/16189183/pexels-photo-16189183.jpeg", "features": ["Chauffeur", "Sport Mode", "Champagne Kit"]},
    {"id": "car_07", "destination": "paris", "name": "Mini Cooper S Cabrio", "type": "Convertible", "seats": 4, "transmission": "Manual", "price": 8999, "image": "https://images.unsplash.com/photo-1774838231308-72e6792f7ab8", "features": ["City Ready", "Convertible", "Bluetooth"]},
    {"id": "car_08", "destination": "manali", "name": "Force Gurkha 4x4", "type": "SUV", "seats": 5, "transmission": "Manual", "price": 4799, "image": "https://images.pexels.com/photos/16189183/pexels-photo-16189183.jpeg", "features": ["Off-Road", "Snorkel", "Diff Lock"]},
]

CURATED_PLACES = {
    "goa": [
        {"name": "Vagator Beach", "rating": 4.6, "type": "Beach", "image": "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg"},
        {"name": "Fort Aguada", "rating": 4.5, "type": "Historical Fort", "image": "https://images.unsplash.com/photo-1757439402375-2f2a4ab0dc75"},
        {"name": "Dudhsagar Falls", "rating": 4.7, "type": "Waterfall", "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg"},
        {"name": "Anjuna Flea Market", "rating": 4.3, "type": "Market", "image": "https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg"},
    ],
    "jaipur": [
        {"name": "Hawa Mahal", "rating": 4.7, "type": "Monument", "image": "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4"},
        {"name": "Amber Fort", "rating": 4.8, "type": "Fort", "image": "https://images.pexels.com/photos/9629654/pexels-photo-9629654.jpeg"},
        {"name": "City Palace", "rating": 4.6, "type": "Palace", "image": "https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg"},
        {"name": "Nahargarh Fort", "rating": 4.5, "type": "Viewpoint", "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg"},
    ],
    "manali": [
        {"name": "Solang Valley", "rating": 4.7, "type": "Adventure", "image": "https://images.pexels.com/photos/9629654/pexels-photo-9629654.jpeg"},
        {"name": "Rohtang Pass", "rating": 4.6, "type": "Mountain Pass", "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg"},
        {"name": "Hadimba Temple", "rating": 4.5, "type": "Temple", "image": "https://images.unsplash.com/photo-1757439402375-2f2a4ab0dc75"},
        {"name": "Old Manali", "rating": 4.4, "type": "Neighborhood", "image": "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg"},
    ],
    "bali": [
        {"name": "Uluwatu Temple", "rating": 4.7, "type": "Temple", "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg"},
        {"name": "Tegallalang Rice Terrace", "rating": 4.8, "type": "Nature", "image": "https://images.pexels.com/photos/9629654/pexels-photo-9629654.jpeg"},
        {"name": "Seminyak Beach", "rating": 4.5, "type": "Beach", "image": "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg"},
        {"name": "Mount Batur", "rating": 4.8, "type": "Volcano Hike", "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg"},
    ],
    "dubai": [
        {"name": "Burj Khalifa", "rating": 4.7, "type": "Landmark", "image": "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4"},
        {"name": "Palm Jumeirah", "rating": 4.6, "type": "Beach & Skyline", "image": "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg"},
        {"name": "Desert Safari", "rating": 4.8, "type": "Adventure", "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg"},
        {"name": "Dubai Marina", "rating": 4.6, "type": "Waterfront", "image": "https://images.unsplash.com/photo-1757439402375-2f2a4ab0dc75"},
    ],
    "paris": [
        {"name": "Eiffel Tower", "rating": 4.7, "type": "Landmark", "image": "https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg"},
        {"name": "Louvre Museum", "rating": 4.8, "type": "Museum", "image": "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4"},
        {"name": "Montmartre", "rating": 4.6, "type": "Neighborhood", "image": "https://images.pexels.com/photos/9629654/pexels-photo-9629654.jpeg"},
        {"name": "Seine River Cruise", "rating": 4.5, "type": "Experience", "image": "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg"},
    ],
}

# ---------- Reviews (curated) ----------
_AVATARS = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
]
_TRAVELLER_PHOTOS = [
    "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg",
    "https://images.unsplash.com/photo-1757439402375-2f2a4ab0dc75",
    "https://images.pexels.com/photos/13813465/pexels-photo-13813465.jpeg",
    "https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4",
    "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg",
    "https://images.pexels.com/photos/9629654/pexels-photo-9629654.jpeg",
]
_REVIEW_LINES = [
    ("Priya S.", "India", 5, "Absolutely breathtaking. The staff remembered our names by day two and the pool at sunset is otherworldly. Coming back for our anniversary."),
    ("Marcus L.", "Germany", 5, "Every detail was thought through — from the welcome drink to the little chocolate on the pillow. The location made day trips effortless."),
    ("Aisha K.", "UAE", 4, "Beautiful property, incredible views. Only knocked one star because the wifi was spotty near the beachfront cabana."),
    ("Rahul T.", "India", 5, "Booked through Travelo and everything was seamless. The check-in was instant with our confirmation email."),
    ("Sofia M.", "Spain", 4, "The room was gorgeous and breakfast was a highlight. Would love room service to be a touch faster next time."),
    ("James O.", "UK", 5, "One of the best stays we've had — the concierge arranged a private guide, transport, and dinner reservations without us lifting a finger."),
    ("Nadia R.", "France", 5, "Design lovers, this is your spot. Every corner felt curated. Sunsets from the terrace are unreal."),
    ("Kenji A.", "Japan", 4, "Tranquil, tasteful, and the food was spectacular. Slightly compact rooms but everything else made up for it."),
]

def _build_reviews(hotel_id: str, base_rating: float):
    import random
    rng = random.Random(hash(hotel_id) & 0xFFFF)
    picks = rng.sample(_REVIEW_LINES, k=6)
    months = ["Jan", "Nov", "Oct", "Sep", "Aug", "Jul"]
    reviews = []
    for i, (name, country, rating, text) in enumerate(picks):
        photos = rng.sample(_TRAVELLER_PHOTOS, k=rng.choice([0, 1, 2, 2]))
        reviews.append({
            "id": f"rv_{hotel_id}_{i}",
            "name": name,
            "country": country,
            "avatar": _AVATARS[i % len(_AVATARS)],
            "rating": rating,
            "date": f"{months[i]} 2026",
            "text": text,
            "photos": photos,
        })
    # rating breakdown around base_rating
    breakdown = {
        "cleanliness": round(min(5.0, base_rating + 0.1), 1),
        "location": round(min(5.0, base_rating + 0.15), 1),
        "service": round(base_rating, 1),
        "comfort": round(min(5.0, base_rating + 0.05), 1),
        "value": round(max(3.5, base_rating - 0.2), 1),
        "amenities": round(base_rating, 1),
    }
    return {"breakdown": breakdown, "reviews": reviews, "total": rng.randint(120, 2400)}


# ---------- Models ----------
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None

class BookingCreate(BaseModel):
    item_type: str  # hotel | car
    item_id: str
    destination: str
    start_date: str
    end_date: str
    guests: int = 1
    total_amount: int  # INR


class BundleItem(BaseModel):
    item_type: str  # hotel | car
    item_id: str
    quantity: int = 1  # nights for hotel, days for car


class BundleCreate(BaseModel):
    items: List[BundleItem]
    destination: str
    start_date: str
    end_date: str
    guests: int = 1
    total_amount: int

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    booking_id: str
    user_id: str
    item_type: str
    item_id: str
    item_name: str
    item_image: str
    destination: str
    start_date: str
    end_date: str
    guests: int
    total_amount: int
    payment_status: str = "pending"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: str

class VerifyPaymentIn(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class NearbyIn(BaseModel):
    destination: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius_m: int = 5000

# ---------- Auth Helpers ----------
async def get_current_user(
    request: Request,
    session_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None),
) -> Optional[dict]:
    token = session_token
    if not token and authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
    if not token:
        return None
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user

async def require_user(user: Optional[dict] = Depends(get_current_user)) -> dict:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ---------- Routes ----------
@api.get("/")
async def root():
    return {"app": "Travelo", "status": "ok"}

# Auth
@api.post("/auth/session")
async def auth_session(request: Request, response: Response, x_session_id: Optional[str] = Header(default=None)):
    body = {}
    try:
        body = await request.json()
    except Exception:
        body = {}
    session_id = x_session_id or body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session_id")
    async with httpx.AsyncClient(timeout=20) as hc:
        r = await hc.get(EMERGENT_AUTH_URL, headers={"X-Session-ID": session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()
    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Auth response missing email")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one({"user_id": user_id}, {"$set": {"name": data.get("name"), "picture": data.get("picture")}})
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name"),
            "picture": data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    session_token = data.get("session_token") or uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 3600,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    return {
        "user": {"user_id": user_id, "email": email, "name": data.get("name"), "picture": data.get("picture")},
        "session_token": session_token,
    }

@api.get("/auth/me")
async def auth_me(user: dict = Depends(require_user)):
    return {"user_id": user["user_id"], "email": user["email"], "name": user.get("name"), "picture": user.get("picture")}

@api.post("/auth/logout")
async def auth_logout(response: Response, session_token: Optional[str] = Cookie(default=None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}

# Inventory
@api.get("/destinations")
async def list_destinations():
    return DESTINATIONS

@api.get("/destinations/{slug}")
async def get_destination(slug: str):
    d = next((x for x in DESTINATIONS if x["slug"] == slug), None)
    if not d:
        raise HTTPException(status_code=404, detail="Destination not found")
    return d

@api.get("/hotels")
async def list_hotels(destination: Optional[str] = None, q: Optional[str] = None):
    items = HOTELS
    if destination:
        items = [h for h in items if h["destination"] == destination]
    if q:
        ql = q.lower()
        items = [h for h in items if ql in h["name"].lower() or ql in h["destination"].lower()]
    return items

@api.get("/hotels/{hotel_id}")
async def get_hotel(hotel_id: str):
    h = next((x for x in HOTELS if x["id"] == hotel_id), None)
    if not h:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return h

@api.get("/cars")
async def list_cars(destination: Optional[str] = None, q: Optional[str] = None):
    items = CARS
    if destination:
        items = [c for c in items if c["destination"] == destination]
    if q:
        ql = q.lower()
        items = [c for c in items if ql in c["name"].lower() or ql in c["destination"].lower()]
    return items

@api.get("/cars/{car_id}")
async def get_car(car_id: str):
    c = next((x for x in CARS if x["id"] == car_id), None)
    if not c:
        raise HTTPException(status_code=404, detail="Car not found")
    return c

# Nearby places
@api.post("/places/nearby")
async def places_nearby(body: NearbyIn):
    dest = body.destination
    lat, lng = body.lat, body.lng
    if dest and (lat is None or lng is None):
        d = next((x for x in DESTINATIONS if x["slug"] == dest), None)
        if d:
            lat, lng = d["lat"], d["lng"]

    if MAPS_IS_LIVE and lat is not None and lng is not None:
        try:
            url = "https://places.googleapis.com/v1/places:searchNearby"
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
                "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.primaryType",
            }
            payload = {
                "includedTypes": ["tourist_attraction"],
                "maxResultCount": 10,
                "rankPreference": "POPULARITY",
                "locationRestriction": {"circle": {"center": {"latitude": lat, "longitude": lng}, "radius": body.radius_m}},
            }
            async with httpx.AsyncClient(timeout=15) as hc:
                r = await hc.post(url, headers=headers, json=payload)
            if r.status_code == 200:
                raw = r.json().get("places", [])
                out = []
                for p in raw:
                    photo_ref = None
                    if p.get("photos"):
                        photo_name = p["photos"][0].get("name")
                        if photo_name:
                            photo_ref = f"https://places.googleapis.com/v1/{photo_name}/media?maxHeightPx=600&key={GOOGLE_MAPS_API_KEY}"
                    out.append({
                        "name": p.get("displayName", {}).get("text") or p.get("id"),
                        "rating": p.get("rating"),
                        "reviews": p.get("userRatingCount"),
                        "type": p.get("primaryType", "attraction"),
                        "image": photo_ref or "https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg",
                        "address": p.get("formattedAddress"),
                    })
                return {"source": "google", "places": out}
        except Exception as e:
            logging.warning(f"Google Places failed, falling back: {e}")

    # curated fallback
    if dest and dest in CURATED_PLACES:
        return {"source": "curated", "places": CURATED_PLACES[dest]}
    # generic fallback if lat/lng passed with no destination
    return {"source": "curated", "places": CURATED_PLACES.get("goa", [])}

# Bookings + Payments
def _find_item(item_type: str, item_id: str):
    if item_type == "hotel":
        return next((x for x in HOTELS if x["id"] == item_id), None)
    if item_type == "car":
        return next((x for x in CARS if x["id"] == item_id), None)
    return None

@api.post("/bookings")
async def create_booking(body: BookingCreate, user: dict = Depends(require_user)):
    item = _find_item(body.item_type, body.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    booking_id = f"bk_{uuid.uuid4().hex[:12]}"

    # Create Razorpay order (or demo order)
    amount_paise = int(body.total_amount) * 100
    if RZP_IS_LIVE and rzp_client:
        order = rzp_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": booking_id,
            "notes": {"booking_id": booking_id},
        })
        rzp_order_id = order["id"]
    else:
        rzp_order_id = f"order_demo_{uuid.uuid4().hex[:14]}"

    doc = {
        "booking_id": booking_id,
        "user_id": user["user_id"],
        "item_type": body.item_type,
        "item_id": body.item_id,
        "item_name": item["name"],
        "item_image": item["image"],
        "destination": body.destination,
        "start_date": body.start_date,
        "end_date": body.end_date,
        "guests": body.guests,
        "total_amount": body.total_amount,
        "payment_status": "created",
        "razorpay_order_id": rzp_order_id,
        "razorpay_payment_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one(doc)
    doc.pop("_id", None)
    return {
        "booking": doc,
        "razorpay": {
            "key_id": RZP_KEY_ID,
            "order_id": rzp_order_id,
            "amount": amount_paise,
            "currency": "INR",
            "demo_mode": not RZP_IS_LIVE,
        },
    }

@api.post("/payments/verify")
async def verify_payment(body: VerifyPaymentIn, user: dict = Depends(require_user)):
    booking = await db.bookings.find_one({"booking_id": body.booking_id, "user_id": user["user_id"]}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if RZP_IS_LIVE:
        msg = f"{body.razorpay_order_id}|{body.razorpay_payment_id}".encode()
        expected = hmac.new(RZP_KEY_SECRET.encode(), msg, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, body.razorpay_signature):
            await db.bookings.update_one({"booking_id": body.booking_id}, {"$set": {"payment_status": "failed"}})
            raise HTTPException(status_code=400, detail="Signature verification failed")

    await db.bookings.update_one(
        {"booking_id": body.booking_id},
        {"$set": {
            "payment_status": "paid",
            "razorpay_payment_id": body.razorpay_payment_id,
            "razorpay_signature": body.razorpay_signature,
        }},
    )
    updated = await db.bookings.find_one({"booking_id": body.booking_id}, {"_id": 0})
    email_record = await send_booking_email(user, updated)
    return {"ok": True, "booking": updated, "email": {"status": email_record["status"], "to": email_record["to"], "email_id": email_record["email_id"]}}

@api.get("/bookings/mine")
async def my_bookings(user: dict = Depends(require_user)):
    items = await db.bookings.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return items

@api.get("/bookings/{booking_id}")
async def get_booking(booking_id: str, user: dict = Depends(require_user)):
    b = await db.bookings.find_one({"booking_id": booking_id, "user_id": user["user_id"]}, {"_id": 0})
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b

# Reviews
@api.get("/hotels/{hotel_id}/reviews")
async def hotel_reviews(hotel_id: str):
    h = next((x for x in HOTELS if x["id"] == hotel_id), None)
    if not h:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return _build_reviews(hotel_id, h["rating"])


# ---------- Email ----------
def _fmt_inr(n: int) -> str:
    return f"₹{n:,}".replace(",", ",")

def _booking_email_html(user_name: str, booking: dict) -> str:
    items = booking.get("items") or [{
        "name": booking["item_name"],
        "image": booking["item_image"],
        "item_type": booking["item_type"],
        "subtotal": booking["total_amount"],
    }]
    items_html = ""
    for it in items:
        items_html += f"""
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #222;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td width="80" valign="top">
                <img src="{it.get('image','')}" width="72" height="72" style="border-radius:8px;object-fit:cover;display:block;" />
              </td>
              <td valign="top" style="padding-left:14px;">
                <div style="color:#FF4500;font-size:11px;letter-spacing:2px;text-transform:uppercase;">{it.get('item_type','item')}</div>
                <div style="color:#FAFAFA;font-size:16px;font-weight:600;margin-top:4px;">{it.get('name','')}</div>
                <div style="color:#9CA3AF;font-size:13px;margin-top:2px;">{booking['start_date']} → {booking['end_date']}</div>
              </td>
              <td valign="top" align="right" style="color:#FAFAFA;font-size:15px;font-weight:600;">{_fmt_inr(it.get('subtotal', 0))}</td>
            </tr></table>
          </td>
        </tr>"""
    return f"""
    <div style="background:#0A0A0A;padding:40px 0;font-family:Manrope,Arial,sans-serif;">
      <table width="560" align="center" cellpadding="0" cellspacing="0" style="background:#0F0F0F;border:1px solid #222;border-radius:16px;overflow:hidden;">
        <tr><td style="padding:32px 32px 8px 32px;">
          <div style="display:inline-block;background:#FF4500;color:#000;font-weight:700;padding:4px 10px;border-radius:6px;font-size:12px;letter-spacing:2px;">TRAVELO</div>
          <h1 style="color:#FAFAFA;font-size:28px;margin:20px 0 6px 0;font-weight:800;letter-spacing:-1px;">Your trip is confirmed.</h1>
          <p style="color:#9CA3AF;font-size:14px;margin:0;">Hey {user_name or 'traveller'} — thanks for booking with Travelo. Here are your details.</p>
        </td></tr>
        <tr><td style="padding:16px 32px;">
          <div style="color:#FF4500;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Booking</div>
          <div style="color:#FAFAFA;font-family:monospace;font-size:13px;">{booking['booking_id']}</div>
        </td></tr>
        <tr><td style="padding:0 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">{items_html}</table>
        </td></tr>
        <tr><td style="padding:20px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="color:#FAFAFA;font-size:20px;font-weight:800;">Total paid</td>
                <td align="right" style="color:#FF4500;font-size:20px;font-weight:800;">{_fmt_inr(booking['total_amount'])}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:8px 32px 32px 32px;">
          <p style="color:#6B7280;font-size:12px;margin:0;line-height:1.6;">A copy of this booking is available anytime under <em>My Trips</em>. Need help? Just reply to this email.</p>
        </td></tr>
      </table>
      <div style="text-align:center;color:#4B5563;font-size:11px;margin-top:20px;letter-spacing:2px;">TRAVELO · CRAFT YOUR JOURNEY</div>
    </div>
    """

async def send_booking_email(user: dict, booking: dict) -> dict:
    to_email = user.get("email")
    subject = f"Trip confirmed — {booking['booking_id']}"
    html = _booking_email_html(user.get("name") or "", booking)
    status = "mocked"
    provider_id = None
    error = None
    if RESEND_IS_LIVE and to_email:
        try:
            params = {
                "from": f"{FROM_NAME} <{SENDER_EMAIL}>",
                "to": [to_email],
                "subject": subject,
                "html": html,
            }
            result = await asyncio.to_thread(resend.Emails.send, params)
            provider_id = result.get("id") if isinstance(result, dict) else None
            status = "sent"
        except Exception as e:
            status = "failed"
            error = str(e)
            logging.warning(f"Resend send failed: {e}")
    record = {
        "email_id": f"em_{uuid.uuid4().hex[:12]}",
        "booking_id": booking["booking_id"],
        "user_id": user["user_id"],
        "to": to_email,
        "subject": subject,
        "html": html,
        "status": status,
        "provider_id": provider_id,
        "error": error,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.emails.insert_one(record)
    record.pop("_id", None)
    return record

@api.get("/emails/mine")
async def my_emails(user: dict = Depends(require_user)):
    emails = await db.emails.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return emails


# ---------- Bundle bookings ----------
@api.post("/bookings/bundle")
async def create_bundle(body: BundleCreate, user: dict = Depends(require_user)):
    if len(body.items) < 2:
        raise HTTPException(status_code=400, detail="A bundle needs at least 2 items")

    items_out = []
    combined_name_parts = []
    hero_image = None
    for it in body.items:
        raw = _find_item(it.item_type, it.item_id)
        if not raw:
            raise HTTPException(status_code=404, detail=f"{it.item_type} {it.item_id} not found")
        subtotal = raw["price"] * max(1, it.quantity)
        items_out.append({
            "item_type": it.item_type,
            "item_id": it.item_id,
            "name": raw["name"],
            "image": raw["image"],
            "price": raw["price"],
            "quantity": it.quantity,
            "subtotal": subtotal,
        })
        combined_name_parts.append(raw["name"])
        if hero_image is None:
            hero_image = raw["image"]

    booking_id = f"bk_{uuid.uuid4().hex[:12]}"
    amount_paise = int(body.total_amount) * 100
    if RZP_IS_LIVE and rzp_client:
        order = rzp_client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": booking_id,
            "notes": {"booking_id": booking_id, "type": "bundle"},
        })
        rzp_order_id = order["id"]
    else:
        rzp_order_id = f"order_demo_{uuid.uuid4().hex[:14]}"

    doc = {
        "booking_id": booking_id,
        "user_id": user["user_id"],
        "item_type": "bundle",
        "item_id": items_out[0]["item_id"],
        "item_name": " + ".join(combined_name_parts),
        "item_image": hero_image or "",
        "items": items_out,
        "is_bundle": True,
        "destination": body.destination,
        "start_date": body.start_date,
        "end_date": body.end_date,
        "guests": body.guests,
        "total_amount": body.total_amount,
        "payment_status": "created",
        "razorpay_order_id": rzp_order_id,
        "razorpay_payment_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.bookings.insert_one(doc)
    doc.pop("_id", None)
    return {
        "booking": doc,
        "razorpay": {
            "key_id": RZP_KEY_ID,
            "order_id": rzp_order_id,
            "amount": amount_paise,
            "currency": "INR",
            "demo_mode": not RZP_IS_LIVE,
        },
    }


# ---------- Wishlist ----------
class WishlistToggleIn(BaseModel):
    hotel_id: str

@api.get("/wishlist")
async def get_wishlist(user: dict = Depends(require_user)):
    rows = await db.wishlists.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    hotel_ids = [r["hotel_id"] for r in rows]
    hotels = [h for h in HOTELS if h["id"] in hotel_ids]
    # preserve wishlist order
    order = {hid: i for i, hid in enumerate(hotel_ids)}
    hotels.sort(key=lambda h: order.get(h["id"], 9999))
    return {"hotel_ids": hotel_ids, "hotels": hotels}

@api.post("/wishlist/toggle")
async def toggle_wishlist(body: WishlistToggleIn, user: dict = Depends(require_user)):
    h = next((x for x in HOTELS if x["id"] == body.hotel_id), None)
    if not h:
        raise HTTPException(status_code=404, detail="Hotel not found")
    existing = await db.wishlists.find_one({"user_id": user["user_id"], "hotel_id": body.hotel_id})
    if existing:
        await db.wishlists.delete_one({"user_id": user["user_id"], "hotel_id": body.hotel_id})
        return {"hotel_id": body.hotel_id, "in_wishlist": False}
    await db.wishlists.insert_one({
        "user_id": user["user_id"],
        "hotel_id": body.hotel_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"hotel_id": body.hotel_id, "in_wishlist": True}


# ---------- File serving ----------
@api.get("/files/{storage_path:path}")
async def serve_file(storage_path: str):
    record = await db.uploaded_files.find_one({"storage_path": storage_path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, ctype = await asyncio.to_thread(get_object_sync, storage_path)
    except Exception as e:
        logging.warning(f"File fetch failed: {e}")
        raise HTTPException(status_code=404, detail="File unavailable")
    return Response(content=data, media_type=record.get("content_type") or ctype)


# ---------- Traveller photos (reviews wall) ----------
ALLOWED_IMG_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB

@api.post("/hotels/{hotel_id}/photos")
async def upload_hotel_photo(
    hotel_id: str,
    file: UploadFile = File(...),
    caption: str = Form(""),
    user: dict = Depends(require_user),
):
    h = next((x for x in HOTELS if x["id"] == hotel_id), None)
    if not h:
        raise HTTPException(status_code=404, detail="Hotel not found")
    ctype = (file.content_type or "").lower()
    if ctype not in ALLOWED_IMG_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG/PNG/WEBP images are allowed")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Image exceeds 5MB limit")
    if len(data) == 0:
        raise HTTPException(status_code=400, detail="Empty file")

    # Require the user to have a paid booking that includes this hotel
    paid = await db.bookings.find_one({
        "user_id": user["user_id"],
        "payment_status": "paid",
        "$or": [
            {"item_type": "hotel", "item_id": hotel_id},
            {"is_bundle": True, "items.item_id": hotel_id, "items.item_type": "hotel"},
        ],
    })
    if not paid:
        raise HTTPException(status_code=403, detail="You can share photos only after a paid stay at this hotel")

    ext = (file.filename or "img").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else "jpg"
    if ext not in {"jpg", "jpeg", "png", "webp"}:
        ext = "jpg"
    storage_path = f"{APP_NAME}/hotel-photos/{hotel_id}/{user['user_id']}/{uuid.uuid4().hex}.{ext}"
    try:
        result = await asyncio.to_thread(put_object_sync, storage_path, data, ctype)
    except HTTPException:
        raise
    except Exception as e:
        logging.warning(f"Upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload failed")

    photo_id = f"ph_{uuid.uuid4().hex[:12]}"
    doc = {
        "photo_id": photo_id,
        "hotel_id": hotel_id,
        "user_id": user["user_id"],
        "user_name": user.get("name") or user.get("email", "").split("@")[0],
        "user_picture": user.get("picture") or "",
        "storage_path": result["path"],
        "caption": caption[:280],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.hotel_photos.insert_one(doc)
    await db.uploaded_files.insert_one({
        "storage_path": result["path"],
        "content_type": ctype,
        "size": result.get("size", len(data)),
        "user_id": user["user_id"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    doc.pop("_id", None)
    doc["url"] = f"/api/files/{result['path']}"
    return doc

@api.get("/hotels/{hotel_id}/photos")
async def list_hotel_photos(hotel_id: str, user: Optional[dict] = Depends(get_current_user)):
    rows = await db.hotel_photos.find({"hotel_id": hotel_id}, {"_id": 0}).to_list(200)
    if not rows:
        return []
    photo_ids = [r["photo_id"] for r in rows]

    # aggregate counts
    pipeline = [
        {"$match": {"photo_id": {"$in": photo_ids}}},
        {"$group": {"_id": {"photo_id": "$photo_id", "reaction_type": "$reaction_type"}, "count": {"$sum": 1}}},
    ]
    counts = {}
    async for c in db.photo_reactions.aggregate(pipeline):
        pid = c["_id"]["photo_id"]
        rtype = c["_id"]["reaction_type"]
        counts.setdefault(pid, {"like": 0, "bookmark": 0})[rtype] = c["count"]

    my = {}
    if user:
        async for r in db.photo_reactions.find(
            {"photo_id": {"$in": photo_ids}, "user_id": user["user_id"]},
            {"_id": 0, "photo_id": 1, "reaction_type": 1},
        ):
            my.setdefault(r["photo_id"], set()).add(r["reaction_type"])

    for r in rows:
        pid = r["photo_id"]
        r["url"] = f"/api/files/{r['storage_path']}"
        r["like_count"] = counts.get(pid, {}).get("like", 0)
        r["bookmark_count"] = counts.get(pid, {}).get("bookmark", 0)
        r["my_liked"] = "like" in my.get(pid, set())
        r["my_bookmarked"] = "bookmark" in my.get(pid, set())

    # best shots rise to the top: likes desc, then bookmarks desc, then newest first
    rows.sort(key=lambda p: (p["like_count"], p["bookmark_count"], p["created_at"]), reverse=True)
    return rows


# ---------- Photo Reactions ----------
class ReactionIn(BaseModel):
    reaction_type: str  # 'like' | 'bookmark'

@api.post("/photos/{photo_id}/reactions")
async def toggle_reaction(photo_id: str, body: ReactionIn, user: dict = Depends(require_user)):
    if body.reaction_type not in {"like", "bookmark"}:
        raise HTTPException(status_code=400, detail="Invalid reaction_type")
    photo = await db.hotel_photos.find_one({"photo_id": photo_id}, {"_id": 0})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    existing = await db.photo_reactions.find_one({
        "photo_id": photo_id,
        "user_id": user["user_id"],
        "reaction_type": body.reaction_type,
    })
    if existing:
        await db.photo_reactions.delete_one({
            "photo_id": photo_id,
            "user_id": user["user_id"],
            "reaction_type": body.reaction_type,
        })
        active = False
    else:
        await db.photo_reactions.insert_one({
            "photo_id": photo_id,
            "user_id": user["user_id"],
            "reaction_type": body.reaction_type,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        active = True

    like_count = await db.photo_reactions.count_documents({"photo_id": photo_id, "reaction_type": "like"})
    bookmark_count = await db.photo_reactions.count_documents({"photo_id": photo_id, "reaction_type": "bookmark"})
    return {
        "photo_id": photo_id,
        "reaction_type": body.reaction_type,
        "active": active,
        "like_count": like_count,
        "bookmark_count": bookmark_count,
    }

@api.get("/photos/bookmarks")
async def my_bookmarks(user: dict = Depends(require_user)):
    reactions = await db.photo_reactions.find(
        {"user_id": user["user_id"], "reaction_type": "bookmark"},
        {"_id": 0},
    ).sort("created_at", -1).to_list(200)
    photo_ids = [r["photo_id"] for r in reactions]
    photos = await db.hotel_photos.find({"photo_id": {"$in": photo_ids}}, {"_id": 0}).to_list(200)
    order = {pid: i for i, pid in enumerate(photo_ids)}
    photos.sort(key=lambda p: order.get(p["photo_id"], 9999))
    for p in photos:
        p["url"] = f"/api/files/{p['storage_path']}"
    return photos


# ---------- AI Concierge ----------
class ConciergeIn(BaseModel):
    destination_slug: str
    days: int = 3
    interests: List[str] = []

@api.post("/concierge/itinerary")
async def concierge_itinerary(body: ConciergeIn):
    dest = next((x for x in DESTINATIONS if x["slug"] == body.destination_slug), None)
    if not dest:
        raise HTTPException(status_code=404, detail="Destination not found")
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=503, detail="Concierge unavailable")

    days = max(1, min(7, body.days))
    interests = ", ".join([i.strip() for i in body.interests if i.strip()]) or "general sightseeing"

    # Include nearby places as context
    curated = CURATED_PLACES.get(body.destination_slug, [])
    place_hints = ", ".join([p["name"] for p in curated[:6]]) or dest["name"]

    system = (
        "You are Travelo Concierge, a warm, world-class travel planner. "
        "Always answer with pure JSON matching the requested schema. "
        "Write in short evocative sentences. Prefer local, authentic experiences over tourist traps."
    )
    prompt = (
        f"Plan a {days}-day itinerary for {dest['name']}, {dest['country']}.\n"
        f"Traveller interests: {interests}.\n"
        f"Consider these nearby highlights (feel free to include or improve on them): {place_hints}.\n"
        "Return ONLY a JSON object of the exact shape:\n"
        "{\n"
        '  "summary": "1-2 sentence vibe of the whole trip",\n'
        '  "days": [ {"day": 1, "theme": "...", "morning": "...", "afternoon": "...", "evening": "...", "tip": "..." } ]\n'
        "}\n"
        "No markdown. No commentary. Just JSON."
    )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"concierge_{body.destination_slug}_{uuid.uuid4().hex[:6]}",
        system_message=system,
    ).with_model("anthropic", "claude-sonnet-4-5-20250929")

    try:
        text = await chat.send_message(UserMessage(text=prompt))
    except Exception as e:
        logging.error(f"Concierge LLM failed: {e}")
        raise HTTPException(status_code=502, detail="Concierge is resting — try again")

    raw = text.strip()
    # strip common markdown fences
    if raw.startswith("```"):
        raw = raw.strip("`")
        if raw.lower().startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    try:
        data = json.loads(raw)
    except Exception:
        # last resort: find first {...} block
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1:
            try:
                data = json.loads(raw[start:end + 1])
            except Exception:
                raise HTTPException(status_code=502, detail="Concierge returned invalid JSON")
        else:
            raise HTTPException(status_code=502, detail="Concierge returned invalid JSON")

    return {
        "destination": {"slug": dest["slug"], "name": dest["name"], "country": dest["country"]},
        "days_requested": days,
        "interests": [i.strip() for i in body.interests if i.strip()],
        "itinerary": data,
    }


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_init():
    try:
        key = await asyncio.to_thread(init_storage)
        if key:
            logger.info("Object storage initialized")
        else:
            logger.warning("Object storage not initialized (missing EMERGENT_LLM_KEY)")
    except Exception as e:
        logger.warning(f"Storage init error: {e}")

@app.on_event("shutdown")
async def shutdown_db():
    client.close()
