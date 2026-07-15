"""End-to-end backend tests for Travelo.
Covers: health, destinations, hotels, cars, nearby places, auth, bookings, payments.
"""
import requests
import pytest


# -------------------- Health --------------------
class TestHealth:
    def test_root(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200
        data = r.json()
        assert data == {"app": "Travelo", "status": "ok"}


# -------------------- Destinations --------------------
class TestDestinations:
    def test_list_destinations(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/destinations")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6
        slugs = {d["slug"] for d in data}
        assert slugs == {"goa", "jaipur", "manali", "bali", "dubai", "paris"}
        required = {"slug", "name", "country", "lat", "lng", "tagline", "image"}
        for d in data:
            assert required.issubset(d.keys())

    def test_get_destination_goa(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/destinations/goa")
        assert r.status_code == 200
        d = r.json()
        assert d["slug"] == "goa"
        assert d["name"] == "Goa"
        assert d["country"] == "India"

    def test_get_destination_unknown(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/destinations/mars")
        assert r.status_code == 404


# -------------------- Hotels --------------------
class TestHotels:
    def test_list_hotels(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 8

    def test_filter_hotels_by_destination(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels", params={"destination": "goa"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 2
        assert all(h["destination"] == "goa" for h in data)

    def test_search_hotels_q_palace(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels", params={"q": "palace"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert any("palace" in h["name"].lower() for h in data)

    def test_get_hotel_by_id(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels/htl_01")
        assert r.status_code == 200
        h = r.json()
        assert h["id"] == "htl_01"
        assert h["name"] == "The Coral Vault"

    def test_get_hotel_unknown(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels/htl_999")
        assert r.status_code == 404


# -------------------- Cars --------------------
class TestCars:
    def test_list_cars(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/cars")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 8

    def test_filter_cars_by_destination(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/cars", params={"destination": "goa"})
        assert r.status_code == 200
        data = r.json()
        assert all(c["destination"] == "goa" for c in data)
        assert len(data) >= 1

    def test_get_car_by_id(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/cars/car_01")
        assert r.status_code == 200
        c = r.json()
        assert c["id"] == "car_01"
        assert "Thar" in c["name"]


# -------------------- Nearby Places --------------------
class TestNearbyPlaces:
    def test_nearby_goa_curated(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/places/nearby", json={"destination": "goa"})
        assert r.status_code == 200
        data = r.json()
        assert data["source"] == "curated"
        assert isinstance(data["places"], list)
        assert len(data["places"]) >= 4
        for p in data["places"]:
            assert "name" in p and "rating" in p and "type" in p and "image" in p

    def test_nearby_jaipur_curated(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/places/nearby", json={"destination": "jaipur"})
        assert r.status_code == 200
        data = r.json()
        assert data["source"] == "curated"
        names = {p["name"] for p in data["places"]}
        assert "Hawa Mahal" in names


# -------------------- Auth --------------------
class TestAuth:
    def test_session_without_session_id(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/auth/session", json={})
        assert r.status_code == 400

    def test_me_without_token(self, base_url):
        # fresh session w/o cookies/headers
        r = requests.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_seeded_token(self, base_url, auth_headers, seeded_session):
        r = requests.get(f"{base_url}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["user_id"] == seeded_session["user_id"]
        assert "email" in data


# -------------------- Bookings + Payments (demo mode) --------------------
class TestBookingsFlow:
    booking_id = None
    order_id = None

    def test_bookings_mine_unauth(self, base_url):
        r = requests.get(f"{base_url}/api/bookings/mine")
        assert r.status_code == 401

    def test_create_booking(self, base_url, auth_headers):
        payload = {
            "item_type": "hotel",
            "item_id": "htl_01",
            "destination": "goa",
            "start_date": "2026-02-01",
            "end_date": "2026-02-04",
            "guests": 2,
            "total_amount": 21789,
        }
        r = requests.post(f"{base_url}/api/bookings", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "booking" in data and "razorpay" in data
        booking = data["booking"]
        rzp = data["razorpay"]
        assert booking["item_id"] == "htl_01"
        assert booking["item_name"] == "The Coral Vault"
        assert booking["total_amount"] == 21789
        assert booking["payment_status"] == "created"
        assert rzp["demo_mode"] is True
        assert rzp["order_id"].startswith("order_demo_")
        assert rzp["amount"] == 21789 * 100
        assert rzp["currency"] == "INR"
        assert "_id" not in booking
        TestBookingsFlow.booking_id = booking["booking_id"]
        TestBookingsFlow.order_id = rzp["order_id"]

    def test_verify_payment_demo(self, base_url, auth_headers):
        assert TestBookingsFlow.booking_id, "Need booking from previous test"
        payload = {
            "booking_id": TestBookingsFlow.booking_id,
            "razorpay_order_id": TestBookingsFlow.order_id,
            "razorpay_payment_id": "pay_demo_test123",
            "razorpay_signature": "demo_signature",
        }
        r = requests.post(f"{base_url}/api/payments/verify", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert data["booking"]["payment_status"] == "paid"
        assert data["booking"]["razorpay_payment_id"] == "pay_demo_test123"

    def test_bookings_mine_lists_created(self, base_url, auth_headers):
        r = requests.get(f"{base_url}/api/bookings/mine", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) >= 1
        ids = [b["booking_id"] for b in data]
        assert TestBookingsFlow.booking_id in ids

    def test_get_booking_by_id(self, base_url, auth_headers):
        r = requests.get(
            f"{base_url}/api/bookings/{TestBookingsFlow.booking_id}",
            headers=auth_headers,
        )
        assert r.status_code == 200
        assert r.json()["booking_id"] == TestBookingsFlow.booking_id

    def test_get_booking_unknown(self, base_url, auth_headers):
        r = requests.get(f"{base_url}/api/bookings/bk_doesnotexist", headers=auth_headers)
        assert r.status_code == 404


# -------------------- Logout --------------------
class TestLogout:
    def test_logout_deletes_session(self, base_url, mongo_db):
        # Create a throwaway session
        import uuid as _u
        from datetime import datetime, timezone, timedelta
        token = f"test_logout_{_u.uuid4().hex}"
        uid = f"test-user-logout-{_u.uuid4().hex[:6]}"
        mongo_db.users.insert_one({"user_id": uid, "email": f"TEST_{uid}@example.com", "created_at": datetime.now(timezone.utc).isoformat()})
        mongo_db.user_sessions.insert_one({
            "user_id": uid, "session_token": token,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        try:
            # confirm it works
            r = requests.get(f"{base_url}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert r.status_code == 200
            # logout via cookie
            r2 = requests.post(f"{base_url}/api/auth/logout", cookies={"session_token": token})
            assert r2.status_code == 200
            assert r2.json() == {"ok": True}
            # session should be gone
            r3 = requests.get(f"{base_url}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
            assert r3.status_code == 401
        finally:
            mongo_db.user_sessions.delete_many({"user_id": uid})
            mongo_db.users.delete_many({"user_id": uid})
