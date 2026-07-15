"""Travelo iteration 3 backend tests — Wishlist, Photo Uploads, AI Concierge."""
import io
import os
import uuid
import time
import pytest
import requests
from datetime import datetime, timezone


# ---------- Wishlist ----------
class TestWishlist:

    def test_wishlist_requires_auth(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/wishlist/toggle", json={"hotel_id": "htl_01"})
        assert r.status_code == 401

    def test_wishlist_get_requires_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/wishlist")
        assert r.status_code == 401

    def test_wishlist_empty_for_new_user(self, api_client, base_url, auth_headers, mongo_db, seeded_session):
        mongo_db.wishlists.delete_many({"user_id": seeded_session["user_id"]})
        r = api_client.get(f"{base_url}/api/wishlist", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data == {"hotel_ids": [], "hotels": []}

    def test_wishlist_unknown_hotel_returns_404(self, api_client, base_url, auth_headers):
        r = api_client.post(f"{base_url}/api/wishlist/toggle", json={"hotel_id": "htl_does_not_exist"}, headers=auth_headers)
        assert r.status_code == 404

    def test_wishlist_toggle_flow(self, api_client, base_url, auth_headers, mongo_db, seeded_session):
        mongo_db.wishlists.delete_many({"user_id": seeded_session["user_id"]})
        # First toggle → added
        r1 = api_client.post(f"{base_url}/api/wishlist/toggle", json={"hotel_id": "htl_01"}, headers=auth_headers)
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1 == {"hotel_id": "htl_01", "in_wishlist": True}

        # GET reflects it
        r_get = api_client.get(f"{base_url}/api/wishlist", headers=auth_headers)
        assert r_get.status_code == 200
        got = r_get.json()
        assert "htl_01" in got["hotel_ids"]
        assert any(h["id"] == "htl_01" for h in got["hotels"])

        # Second toggle → removed
        r2 = api_client.post(f"{base_url}/api/wishlist/toggle", json={"hotel_id": "htl_01"}, headers=auth_headers)
        assert r2.status_code == 200
        assert r2.json() == {"hotel_id": "htl_01", "in_wishlist": False}

        # GET is empty again
        r_get2 = api_client.get(f"{base_url}/api/wishlist", headers=auth_headers)
        assert "htl_01" not in r_get2.json()["hotel_ids"]

    def test_wishlist_order_most_recent_first(self, api_client, base_url, auth_headers, mongo_db, seeded_session):
        mongo_db.wishlists.delete_many({"user_id": seeded_session["user_id"]})
        for hid in ["htl_02", "htl_03", "htl_04"]:
            r = api_client.post(f"{base_url}/api/wishlist/toggle", json={"hotel_id": hid}, headers=auth_headers)
            assert r.status_code == 200
            time.sleep(0.05)
        r_get = api_client.get(f"{base_url}/api/wishlist", headers=auth_headers)
        ids = r_get.json()["hotel_ids"]
        # sort by created_at desc → last added is first
        assert ids[0] == "htl_04"
        assert ids[-1] == "htl_02"
        # cleanup
        mongo_db.wishlists.delete_many({"user_id": seeded_session["user_id"]})


# ---------- Photo uploads (require paid booking) ----------
class TestHotelPhotos:

    def _make_png_bytes(self, size_bytes: int = 300) -> bytes:
        # minimal PNG header + padding
        png_header = bytes.fromhex(
            "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489"
            "0000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
        )
        pad = b"\x00" * max(0, size_bytes - len(png_header))
        return png_header + pad

    def test_public_list_photos_empty(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels/htl_01/photos")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_list_photos_unknown_hotel_returns_empty_list(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels/htl_zzz/photos")
        # Endpoint returns [] even for unknown hotels (public listing) — verify 200
        assert r.status_code == 200

    def test_upload_requires_auth(self, api_client, base_url):
        files = {"file": ("t.png", io.BytesIO(self._make_png_bytes()), "image/png")}
        r = requests.post(f"{base_url}/api/hotels/htl_01/photos", files=files, data={"caption": "x"})
        assert r.status_code == 401

    def test_upload_unknown_hotel_404(self, base_url, auth_headers):
        files = {"file": ("t.png", io.BytesIO(self._make_png_bytes()), "image/png")}
        headers = {"Authorization": auth_headers["Authorization"]}
        r = requests.post(f"{base_url}/api/hotels/htl_zzz/photos", files=files, data={"caption": "x"}, headers=headers)
        assert r.status_code == 404

    def test_upload_without_paid_booking_returns_403(self, base_url, auth_headers, mongo_db, seeded_session):
        # ensure no paid booking for this hotel
        mongo_db.bookings.delete_many({"user_id": seeded_session["user_id"]})
        files = {"file": ("t.png", io.BytesIO(self._make_png_bytes()), "image/png")}
        headers = {"Authorization": auth_headers["Authorization"]}
        r = requests.post(f"{base_url}/api/hotels/htl_01/photos", files=files, data={"caption": "no stay"}, headers=headers)
        assert r.status_code == 403
        assert "paid" in r.json().get("detail", "").lower()

    def test_upload_invalid_content_type_400(self, base_url, auth_headers, mongo_db, seeded_session):
        # seed paid booking so we get past auth to the content-type check
        mongo_db.bookings.insert_one({
            "booking_id": f"bk_test_{uuid.uuid4().hex[:8]}",
            "user_id": seeded_session["user_id"],
            "item_type": "hotel",
            "item_id": "htl_01",
            "item_name": "Test",
            "item_image": "",
            "destination": "goa",
            "start_date": "2026-02-01",
            "end_date": "2026-02-03",
            "guests": 2,
            "total_amount": 5000,
            "payment_status": "paid",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        files = {"file": ("t.txt", io.BytesIO(b"hello"), "text/plain")}
        headers = {"Authorization": auth_headers["Authorization"]}
        r = requests.post(f"{base_url}/api/hotels/htl_01/photos", files=files, data={"caption": "x"}, headers=headers)
        assert r.status_code == 400

    def test_upload_empty_file_400(self, base_url, auth_headers):
        files = {"file": ("t.png", io.BytesIO(b""), "image/png")}
        headers = {"Authorization": auth_headers["Authorization"]}
        r = requests.post(f"{base_url}/api/hotels/htl_01/photos", files=files, data={"caption": "x"}, headers=headers)
        assert r.status_code == 400

    def test_upload_too_large_413(self, base_url, auth_headers):
        big = self._make_png_bytes(5 * 1024 * 1024 + 100)
        files = {"file": ("t.png", io.BytesIO(big), "image/png")}
        headers = {"Authorization": auth_headers["Authorization"]}
        r = requests.post(f"{base_url}/api/hotels/htl_01/photos", files=files, data={"caption": "big"}, headers=headers)
        assert r.status_code == 413

    def test_upload_single_hotel_booking_success_and_file_serves(self, api_client, base_url, auth_headers, mongo_db, seeded_session):
        # ensure paid booking exists (from earlier test), otherwise add it
        if not mongo_db.bookings.find_one({"user_id": seeded_session["user_id"], "payment_status": "paid", "item_type": "hotel", "item_id": "htl_01"}):
            mongo_db.bookings.insert_one({
                "booking_id": f"bk_test_{uuid.uuid4().hex[:8]}",
                "user_id": seeded_session["user_id"],
                "item_type": "hotel", "item_id": "htl_01",
                "item_name": "Test", "item_image": "",
                "destination": "goa", "start_date": "2026-02-01", "end_date": "2026-02-03",
                "guests": 2, "total_amount": 5000,
                "payment_status": "paid",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
        png_bytes = self._make_png_bytes(400)
        files = {"file": ("photo.png", io.BytesIO(png_bytes), "image/png")}
        headers = {"Authorization": auth_headers["Authorization"]}
        r = requests.post(f"{base_url}/api/hotels/htl_01/photos", files=files, data={"caption": "TEST_upload_caption"}, headers=headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["hotel_id"] == "htl_01"
        assert data["caption"] == "TEST_upload_caption"
        assert data["url"].startswith("/api/files/travelo/hotel-photos/htl_01/")
        assert "photo_id" in data
        assert "user_name" in data

        # GET list contains it, ordered desc
        r_list = api_client.get(f"{base_url}/api/hotels/htl_01/photos")
        assert r_list.status_code == 200
        photos = r_list.json()
        assert any(p["photo_id"] == data["photo_id"] for p in photos)
        # check ordering desc
        if len(photos) >= 2:
            for i in range(len(photos) - 1):
                assert photos[i]["created_at"] >= photos[i + 1]["created_at"]

        # File-serve endpoint returns bytes with correct content-type
        rel = data["url"].replace("/api/files/", "")
        r_file = api_client.get(f"{base_url}/api/files/{rel}")
        assert r_file.status_code == 200
        assert r_file.headers.get("Content-Type", "").startswith("image/")
        assert len(r_file.content) == len(png_bytes)

        # cleanup uploads for this user
        mongo_db.hotel_photos.delete_many({"user_id": seeded_session["user_id"]})
        mongo_db.uploaded_files.delete_many({"user_id": seeded_session["user_id"]})
        mongo_db.bookings.delete_many({"user_id": seeded_session["user_id"]})

    def test_upload_with_bundle_booking_success(self, base_url, auth_headers, mongo_db, seeded_session):
        # seed a bundle booking containing htl_02
        mongo_db.bookings.delete_many({"user_id": seeded_session["user_id"]})
        mongo_db.bookings.insert_one({
            "booking_id": f"bk_bundle_{uuid.uuid4().hex[:8]}",
            "user_id": seeded_session["user_id"],
            "item_type": "bundle", "item_id": "htl_02",
            "item_name": "Bundle", "item_image": "",
            "is_bundle": True,
            "items": [
                {"item_type": "hotel", "item_id": "htl_02", "name": "Palm", "image": "", "price": 4299, "quantity": 2, "subtotal": 8598},
                {"item_type": "car", "item_id": "car_01", "name": "Thar", "image": "", "price": 3499, "quantity": 2, "subtotal": 6998},
            ],
            "destination": "goa", "start_date": "2026-02-01", "end_date": "2026-02-03",
            "guests": 2, "total_amount": 15596,
            "payment_status": "paid",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        png = self._make_png_bytes(400)
        files = {"file": ("b.png", io.BytesIO(png), "image/png")}
        headers = {"Authorization": auth_headers["Authorization"]}
        r = requests.post(f"{base_url}/api/hotels/htl_02/photos", files=files, data={"caption": "TEST_bundle"}, headers=headers)
        assert r.status_code == 200, r.text
        # cleanup
        mongo_db.hotel_photos.delete_many({"user_id": seeded_session["user_id"]})
        mongo_db.uploaded_files.delete_many({"user_id": seeded_session["user_id"]})
        mongo_db.bookings.delete_many({"user_id": seeded_session["user_id"]})

    def test_serve_file_unknown_path_404(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/files/travelo/nope/does_not_exist.png")
        assert r.status_code == 404


# ---------- AI Concierge ----------
class TestConcierge:
    def test_concierge_unknown_destination_404(self, api_client, base_url):
        r = api_client.post(f"{base_url}/api/concierge/itinerary", json={
            "destination_slug": "atlantis", "days": 2, "interests": ["food"]
        })
        assert r.status_code == 404

    def test_concierge_generates_itinerary_goa(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/concierge/itinerary",
            json={"destination_slug": "goa", "days": 2, "interests": ["beaches", "food"]},
            timeout=90,
        )
        # Concierge is a live LLM call — if it fails (upstream), report but don't crash suite
        assert r.status_code == 200, f"Concierge failed: {r.status_code} {r.text[:400]}"
        data = r.json()
        assert data["destination"]["slug"] == "goa"
        assert data["destination"]["name"] == "Goa"
        assert data["destination"]["country"] == "India"
        assert data["days_requested"] == 2
        assert set(data["interests"]) == {"beaches", "food"}
        it = data["itinerary"]
        assert "summary" in it and isinstance(it["summary"], str) and len(it["summary"]) > 0
        assert "days" in it and isinstance(it["days"], list) and len(it["days"]) >= 1
        d1 = it["days"][0]
        for field in ("day", "theme", "morning", "afternoon", "evening", "tip"):
            assert field in d1, f"missing {field} in day 1"

    def test_concierge_clamps_days(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/concierge/itinerary",
            json={"destination_slug": "jaipur", "days": 20, "interests": []},
            timeout=90,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["days_requested"] == 7  # clamped upper


# ---------- Iter1 + Iter2 regression sanity ----------
class TestRegression:
    def test_root(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_hotels_list(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels")
        assert r.status_code == 200
        assert len(r.json()) >= 8

    def test_hotel_reviews_still_work(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels/htl_01/reviews")
        assert r.status_code == 200
        data = r.json()
        assert "breakdown" in data and "reviews" in data
        assert len(data["reviews"]) == 6
