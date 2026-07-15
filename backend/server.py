from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Cookie, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hmac
import hashlib
import uuid
import logging
import httpx
import razorpay
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta

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

RZP_IS_LIVE = not RZP_KEY_ID.startswith("rzp_test_placeholder") and not RZP_KEY_SECRET.startswith("placeholder")
MAPS_IS_LIVE = not GOOGLE_MAPS_API_KEY.startswith("placeholder")

rzp_client = None
if RZP_IS_LIVE:
    rzp_client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET))

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

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
    return {"ok": True, "booking": updated}

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

@app.on_event("shutdown")
async def shutdown_db():
    client.close()
