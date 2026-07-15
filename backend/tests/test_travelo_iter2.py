"""Iteration 2 tests — Reviews, Bundle Bookings, Email (mock mode)."""
import requests
import pytest


# -------------------- Reviews --------------------
class TestReviews:
    def test_hotel_reviews_shape(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels/htl_01/reviews")
        assert r.status_code == 200, r.text
        data = r.json()
        # breakdown
        assert "breakdown" in data
        keys = {"cleanliness", "location", "service", "comfort", "value", "amenities"}
        assert set(data["breakdown"].keys()) == keys
        for k, v in data["breakdown"].items():
            assert isinstance(v, (int, float))
            assert 0 < v <= 5
        # reviews
        assert "reviews" in data
        assert len(data["reviews"]) == 6
        for rv in data["reviews"]:
            for f in ("id", "name", "country", "avatar", "rating", "date", "text", "photos"):
                assert f in rv, f"missing field {f}"
            assert rv["id"].startswith("rv_htl_01_")
            assert 1 <= rv["rating"] <= 5
            assert isinstance(rv["photos"], list)
        # total
        assert isinstance(data["total"], int)
        assert data["total"] > 0

    def test_hotel_reviews_all_hotels(self, api_client, base_url):
        # Iterate through all hotels to ensure endpoint returns 6 reviews consistently
        for hid in ["htl_01", "htl_02", "htl_05"]:
            r = api_client.get(f"{base_url}/api/hotels/{hid}/reviews")
            assert r.status_code == 200
            assert len(r.json()["reviews"]) == 6

    def test_hotel_reviews_unknown(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/hotels/htl_999/reviews")
        assert r.status_code == 404


# -------------------- Bundle Bookings --------------------
class TestBundleBookings:
    bundle_booking_id = None
    bundle_order_id = None

    def test_bundle_requires_auth(self, base_url):
        r = requests.post(f"{base_url}/api/bookings/bundle", json={
            "items": [
                {"item_type": "hotel", "item_id": "htl_01", "quantity": 3},
                {"item_type": "car", "item_id": "car_01", "quantity": 3},
            ],
            "destination": "goa",
            "start_date": "2026-03-01",
            "end_date": "2026-03-04",
            "guests": 2,
            "total_amount": 30000,
        })
        assert r.status_code == 401

    def test_bundle_too_few_items(self, base_url, auth_headers):
        r = requests.post(f"{base_url}/api/bookings/bundle", json={
            "items": [{"item_type": "hotel", "item_id": "htl_01", "quantity": 3}],
            "destination": "goa",
            "start_date": "2026-03-01",
            "end_date": "2026-03-04",
            "guests": 2,
            "total_amount": 20000,
        }, headers=auth_headers)
        assert r.status_code == 400

    def test_bundle_unknown_item(self, base_url, auth_headers):
        r = requests.post(f"{base_url}/api/bookings/bundle", json={
            "items": [
                {"item_type": "hotel", "item_id": "htl_999", "quantity": 3},
                {"item_type": "car", "item_id": "car_01", "quantity": 3},
            ],
            "destination": "goa",
            "start_date": "2026-03-01",
            "end_date": "2026-03-04",
            "guests": 2,
            "total_amount": 30000,
        }, headers=auth_headers)
        assert r.status_code == 404

    def test_bundle_create_success(self, base_url, auth_headers):
        r = requests.post(f"{base_url}/api/bookings/bundle", json={
            "items": [
                {"item_type": "hotel", "item_id": "htl_01", "quantity": 3},
                {"item_type": "car", "item_id": "car_01", "quantity": 3},
            ],
            "destination": "goa",
            "start_date": "2026-03-01",
            "end_date": "2026-03-04",
            "guests": 2,
            "total_amount": 30000,
        }, headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        b = data["booking"]
        rz = data["razorpay"]
        assert b["is_bundle"] is True
        assert len(b["items"]) == 2
        for it in b["items"]:
            for k in ("item_type", "item_id", "name", "image", "price", "quantity", "subtotal"):
                assert k in it
        # item_name = "A + B"
        assert b["item_name"] == "The Coral Vault + Mahindra Thar Roxx"
        assert b["item_type"] == "bundle"
        assert b["total_amount"] == 30000
        assert b["payment_status"] == "created"
        assert rz["demo_mode"] is True
        assert rz["order_id"].startswith("order_demo_")
        assert "_id" not in b
        TestBundleBookings.bundle_booking_id = b["booking_id"]
        TestBundleBookings.bundle_order_id = rz["order_id"]

    def test_bundle_verify_and_email_mock(self, base_url, auth_headers, seeded_session, mongo_db):
        assert TestBundleBookings.bundle_booking_id, "Need bundle from prior test"
        r = requests.post(f"{base_url}/api/payments/verify", json={
            "booking_id": TestBundleBookings.bundle_booking_id,
            "razorpay_order_id": TestBundleBookings.bundle_order_id,
            "razorpay_payment_id": "pay_demo_bundle123",
            "razorpay_signature": "demo_signature",
        }, headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert data["booking"]["payment_status"] == "paid"
        # Email object
        assert "email" in data
        email = data["email"]
        assert email["status"] == "mocked"
        assert email["to"]  # to matches user email
        assert email["email_id"].startswith("em_")

        # Verify email doc persisted in db.emails
        doc = mongo_db.emails.find_one({"email_id": email["email_id"]})
        assert doc is not None
        assert doc["booking_id"] == TestBundleBookings.bundle_booking_id
        assert doc["status"] == "mocked"
        assert doc["to"] == email["to"]
        assert "html" in doc and TestBundleBookings.bundle_booking_id in doc["html"]
        assert ("Trip confirmed" in doc["subject"]) or ("Travelo" in doc["html"])

    def test_bundle_appears_in_my_bookings(self, base_url, auth_headers):
        r = requests.get(f"{base_url}/api/bookings/mine", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        found = [b for b in data if b["booking_id"] == TestBundleBookings.bundle_booking_id]
        assert len(found) == 1
        assert found[0]["is_bundle"] is True
        assert len(found[0]["items"]) == 2
        assert "+ Mahindra Thar Roxx" in found[0]["item_name"]


# -------------------- Emails --------------------
class TestEmails:
    def test_emails_mine_requires_auth(self, base_url):
        r = requests.get(f"{base_url}/api/emails/mine")
        assert r.status_code == 401

    def test_emails_mine_lists_mocked(self, base_url, auth_headers):
        r = requests.get(f"{base_url}/api/emails/mine", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        e = data[0]  # sorted desc → latest
        for f in ("email_id", "booking_id", "to", "subject", "status", "html"):
            assert f in e
        assert e["status"] == "mocked"
        # Sanity check html content
        assert "Trip confirmed" in e["subject"] or "Travelo" in e["html"]
        assert e["booking_id"] in e["html"]


# -------------------- Regression sanity for single-item flow (still works) --------------------
class TestRegressionSingleBooking:
    def test_single_booking_still_works_and_generates_email(self, base_url, auth_headers, mongo_db):
        # Create single booking
        payload = {
            "item_type": "car",
            "item_id": "car_02",
            "destination": "goa",
            "start_date": "2026-04-01",
            "end_date": "2026-04-03",
            "guests": 1,
            "total_amount": 1798,
        }
        r = requests.post(f"{base_url}/api/bookings", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        b = r.json()["booking"]
        rz = r.json()["razorpay"]
        assert rz["demo_mode"] is True
        assert b["item_name"] == "Royal Enfield Meteor"

        # Verify
        vr = requests.post(f"{base_url}/api/payments/verify", json={
            "booking_id": b["booking_id"],
            "razorpay_order_id": rz["order_id"],
            "razorpay_payment_id": "pay_demo_singlereg",
            "razorpay_signature": "demo_signature",
        }, headers=auth_headers)
        assert vr.status_code == 200
        vd = vr.json()
        assert vd["email"]["status"] == "mocked"

        # Ensure the email row exists
        doc = mongo_db.emails.find_one({"booking_id": b["booking_id"]})
        assert doc is not None
        assert doc["status"] == "mocked"
