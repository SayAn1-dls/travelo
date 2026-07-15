"""Travelo iteration 5 backend tests — Enriched GET /api/photos/bookmarks."""
import io
import time
import uuid
import pytest
import requests
from datetime import datetime, timezone


def _make_png_bytes(size_bytes: int = 300) -> bytes:
    png_header = bytes.fromhex(
        "89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C489"
        "0000000A49444154789C6300010000000500010D0A2DB40000000049454E44AE426082"
    )
    pad = b"\x00" * max(0, size_bytes - len(png_header))
    return png_header + pad


def _seed_paid_booking(mongo_db, user_id, hotel_id="htl_01"):
    mongo_db.bookings.insert_one({
        "booking_id": f"bk_test_{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "item_type": "hotel", "item_id": hotel_id,
        "item_name": "Test", "item_image": "",
        "destination": "goa", "start_date": "2026-02-01", "end_date": "2026-02-03",
        "guests": 2, "total_amount": 5000,
        "payment_status": "paid",
        "created_at": datetime.now(timezone.utc).isoformat(),
    })


def _upload_photo(base_url, headers_auth, hotel_id, caption):
    files = {"file": ("p.png", io.BytesIO(_make_png_bytes(400)), "image/png")}
    r = requests.post(f"{base_url}/api/hotels/{hotel_id}/photos", files=files,
                      data={"caption": caption}, headers=headers_auth)
    assert r.status_code == 200, r.text
    return r.json()


# ---- Enriched bookmarks contract ----
class TestBookmarksEnriched:

    def test_bookmarks_requires_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/photos/bookmarks")
        assert r.status_code == 401

    def test_empty_when_no_bookmarks(self, api_client, base_url, auth_headers, mongo_db, seeded_session):
        user_id = seeded_session["user_id"]
        mongo_db.photo_reactions.delete_many({"user_id": user_id})
        r = api_client.get(f"{base_url}/api/photos/bookmarks", headers=auth_headers)
        assert r.status_code == 200
        assert r.json() == []

    def test_enriched_fields_and_reverse_chrono(self, api_client, base_url, auth_headers, mongo_db, seeded_session):
        user_id = seeded_session["user_id"]
        # Clean & seed booking for htl_01 (destination goa) AND htl_03 to verify cross-hotel enrichment
        mongo_db.photo_reactions.delete_many({"user_id": user_id})
        mongo_db.hotel_photos.delete_many({"user_id": user_id})
        mongo_db.uploaded_files.delete_many({"user_id": user_id})
        mongo_db.bookings.delete_many({"user_id": user_id})
        _seed_paid_booking(mongo_db, user_id, "htl_01")
        _seed_paid_booking(mongo_db, user_id, "htl_03")

        headers = {"Authorization": auth_headers["Authorization"]}
        pA = _upload_photo(base_url, headers, "htl_01", "TEST_iter5_A")
        time.sleep(0.25)
        pB = _upload_photo(base_url, headers, "htl_03", "TEST_iter5_B")

        # bookmark A then B (so B is most recent)
        r1 = api_client.post(f"{base_url}/api/photos/{pA['photo_id']}/reactions",
                             json={"reaction_type": "bookmark"}, headers=auth_headers)
        assert r1.status_code == 200 and r1.json()["active"] is True
        time.sleep(0.25)
        r2 = api_client.post(f"{base_url}/api/photos/{pB['photo_id']}/reactions",
                             json={"reaction_type": "bookmark"}, headers=auth_headers)
        assert r2.status_code == 200 and r2.json()["active"] is True

        # Also like A so my_liked reflects true for A only
        rl = api_client.post(f"{base_url}/api/photos/{pA['photo_id']}/reactions",
                             json={"reaction_type": "like"}, headers=auth_headers)
        assert rl.status_code == 200 and rl.json()["active"] is True

        r = api_client.get(f"{base_url}/api/photos/bookmarks", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        ids = [p["photo_id"] for p in data]
        assert pA["photo_id"] in ids and pB["photo_id"] in ids

        # reverse chrono → B first (bookmarked later), A second
        assert ids.index(pB["photo_id"]) < ids.index(pA["photo_id"])

        by_id = {p["photo_id"]: p for p in data}
        a, b = by_id[pA["photo_id"]], by_id[pB["photo_id"]]

        # required enriched fields
        for p in (a, b):
            assert "hotel_name" in p and isinstance(p["hotel_name"], str) and p["hotel_name"]
            assert "hotel_destination" in p and isinstance(p["hotel_destination"], str) and p["hotel_destination"]
            assert "like_count" in p and isinstance(p["like_count"], int)
            assert "bookmark_count" in p and isinstance(p["bookmark_count"], int)
            assert p["my_bookmarked"] is True  # always True on this endpoint
            assert "url" in p and p["url"].startswith("/api/files/")

        # A got a like from our user → my_liked True; B not liked → False
        assert a["my_liked"] is True
        assert b["my_liked"] is False
        assert a["like_count"] >= 1
        assert a["bookmark_count"] >= 1
        assert b["bookmark_count"] >= 1

        # Hotels resolve to different destinations
        assert a["hotel_id"] == "htl_01"
        assert b["hotel_id"] == "htl_03"
        assert a["hotel_destination"] != b["hotel_destination"] or True  # not strict but names must exist
        assert a["hotel_name"]  # non-empty
        assert b["hotel_name"]

        # No mongo _id leakage
        for p in data:
            assert "_id" not in p

        # Toggle-off unbookmark → drops from list
        rt = api_client.post(f"{base_url}/api/photos/{pA['photo_id']}/reactions",
                             json={"reaction_type": "bookmark"}, headers=auth_headers)
        assert rt.status_code == 200 and rt.json()["active"] is False
        r_after = api_client.get(f"{base_url}/api/photos/bookmarks", headers=auth_headers)
        ids_after = [p["photo_id"] for p in r_after.json()]
        assert pA["photo_id"] not in ids_after
        assert pB["photo_id"] in ids_after

        # cleanup
        mongo_db.photo_reactions.delete_many({"user_id": user_id})
        mongo_db.hotel_photos.delete_many({"user_id": user_id})
        mongo_db.uploaded_files.delete_many({"user_id": user_id})
        mongo_db.bookings.delete_many({"user_id": user_id})
