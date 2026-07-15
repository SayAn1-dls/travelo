"""Travelo iteration 4 backend tests — Photo Reactions (like + bookmark)."""
import io
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


def _upload_photo(base_url, headers_auth, hotel_id="htl_01", caption="TEST_iter4_photo"):
    files = {"file": ("p.png", io.BytesIO(_make_png_bytes(400)), "image/png")}
    r = requests.post(f"{base_url}/api/hotels/{hotel_id}/photos", files=files, data={"caption": caption}, headers=headers_auth)
    assert r.status_code == 200, r.text
    return r.json()


# Session-scoped: seed one paid booking + one uploaded photo we can react to
@pytest.fixture(scope="module")
def seeded_photo(base_url, auth_headers, mongo_db, seeded_session):
    user_id = seeded_session["user_id"]
    mongo_db.bookings.delete_many({"user_id": user_id})
    _seed_paid_booking(mongo_db, user_id, "htl_01")
    headers = {"Authorization": auth_headers["Authorization"]}
    photo = _upload_photo(base_url, headers, "htl_01", "TEST_iter4_seed")
    yield photo
    # cleanup
    mongo_db.hotel_photos.delete_many({"user_id": user_id})
    mongo_db.uploaded_files.delete_many({"user_id": user_id})
    mongo_db.photo_reactions.delete_many({"user_id": user_id})
    mongo_db.bookings.delete_many({"user_id": user_id})


# --------------- reactions POST ---------------
class TestPhotoReactions:

    def test_reaction_requires_auth(self, api_client, base_url, seeded_photo):
        r = api_client.post(f"{base_url}/api/photos/{seeded_photo['photo_id']}/reactions",
                            json={"reaction_type": "like"})
        assert r.status_code == 401

    def test_reaction_invalid_type_400(self, api_client, base_url, auth_headers, seeded_photo):
        r = api_client.post(f"{base_url}/api/photos/{seeded_photo['photo_id']}/reactions",
                            json={"reaction_type": "wow"}, headers=auth_headers)
        assert r.status_code == 400

    def test_reaction_unknown_photo_404(self, api_client, base_url, auth_headers):
        r = api_client.post(f"{base_url}/api/photos/ph_does_not_exist/reactions",
                            json={"reaction_type": "like"}, headers=auth_headers)
        assert r.status_code == 404

    def test_like_toggle_flow(self, api_client, base_url, auth_headers, seeded_photo, mongo_db, seeded_session):
        # ensure clean reactions state on this photo for this user
        mongo_db.photo_reactions.delete_many({"user_id": seeded_session["user_id"], "photo_id": seeded_photo["photo_id"]})
        pid = seeded_photo["photo_id"]

        # base counts from GET
        r_before = api_client.get(f"{base_url}/api/hotels/htl_01/photos", headers=auth_headers)
        assert r_before.status_code == 200
        base_photo = next(p for p in r_before.json() if p["photo_id"] == pid)
        base_likes = base_photo["like_count"]

        # First like → active True, +1
        r1 = api_client.post(f"{base_url}/api/photos/{pid}/reactions",
                             json={"reaction_type": "like"}, headers=auth_headers)
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["photo_id"] == pid
        assert d1["reaction_type"] == "like"
        assert d1["active"] is True
        assert d1["like_count"] == base_likes + 1

        # GET reflects my_liked True
        r_mid = api_client.get(f"{base_url}/api/hotels/htl_01/photos", headers=auth_headers)
        mid_photo = next(p for p in r_mid.json() if p["photo_id"] == pid)
        assert mid_photo["my_liked"] is True
        assert mid_photo["like_count"] == base_likes + 1

        # Toggle off
        r2 = api_client.post(f"{base_url}/api/photos/{pid}/reactions",
                             json={"reaction_type": "like"}, headers=auth_headers)
        assert r2.status_code == 200
        d2 = r2.json()
        assert d2["active"] is False
        assert d2["like_count"] == base_likes

        # GET reflects my_liked False
        r_after = api_client.get(f"{base_url}/api/hotels/htl_01/photos", headers=auth_headers)
        after_photo = next(p for p in r_after.json() if p["photo_id"] == pid)
        assert after_photo["my_liked"] is False
        assert after_photo["like_count"] == base_likes

    def test_like_and_bookmark_independent(self, api_client, base_url, auth_headers, seeded_photo, mongo_db, seeded_session):
        mongo_db.photo_reactions.delete_many({"user_id": seeded_session["user_id"], "photo_id": seeded_photo["photo_id"]})
        pid = seeded_photo["photo_id"]

        r_like = api_client.post(f"{base_url}/api/photos/{pid}/reactions",
                                 json={"reaction_type": "like"}, headers=auth_headers)
        assert r_like.status_code == 200 and r_like.json()["active"] is True

        r_bm = api_client.post(f"{base_url}/api/photos/{pid}/reactions",
                               json={"reaction_type": "bookmark"}, headers=auth_headers)
        assert r_bm.status_code == 200 and r_bm.json()["active"] is True
        # both counts should be >= 1
        assert r_bm.json()["like_count"] >= 1
        assert r_bm.json()["bookmark_count"] >= 1

        # GET reflects both my_*
        r_get = api_client.get(f"{base_url}/api/hotels/htl_01/photos", headers=auth_headers)
        photo = next(p for p in r_get.json() if p["photo_id"] == pid)
        assert photo["my_liked"] is True
        assert photo["my_bookmarked"] is True

        # cleanup for later tests
        mongo_db.photo_reactions.delete_many({"user_id": seeded_session["user_id"], "photo_id": pid})


# --------------- GET photos: new fields & unauth defaults ---------------
class TestListPhotosFields:

    def test_unauth_has_counts_and_my_flags_false(self, api_client, base_url, seeded_photo):
        r = api_client.get(f"{base_url}/api/hotels/htl_01/photos")
        assert r.status_code == 200
        photos = r.json()
        assert len(photos) >= 1
        for p in photos:
            assert "like_count" in p and isinstance(p["like_count"], int)
            assert "bookmark_count" in p and isinstance(p["bookmark_count"], int)
            assert p["my_liked"] is False
            assert p["my_bookmarked"] is False


# --------------- Ordering: top shots rise ---------------
class TestOrdering:

    def test_photos_sorted_by_like_then_bookmark_then_created(self, api_client, base_url, auth_headers, mongo_db, seeded_session):
        """Seed 3 photos + reactions and assert ordering (likes DESC, bookmark DESC, created_at DESC)."""
        user_id = seeded_session["user_id"]
        # Fully clean state for this user + this hotel's photos we create
        mongo_db.bookings.delete_many({"user_id": user_id})
        _seed_paid_booking(mongo_db, user_id, "htl_03")

        headers = {"Authorization": auth_headers["Authorization"]}
        # Upload 3 photos to htl_03 in known order
        p_a = _upload_photo(base_url, headers, "htl_03", "TEST_a_oldest")
        import time; time.sleep(0.4)
        p_b = _upload_photo(base_url, headers, "htl_03", "TEST_b_middle")
        time.sleep(0.4)
        p_c = _upload_photo(base_url, headers, "htl_03", "TEST_c_newest")

        # Directly seed reactions from different fake users so counts differ (avoids many session tokens)
        def add_reactions(photo_id, likes=0, bookmarks=0):
            for i in range(likes):
                mongo_db.photo_reactions.insert_one({
                    "photo_id": photo_id, "user_id": f"fake-user-{uuid.uuid4().hex[:6]}",
                    "reaction_type": "like",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
            for i in range(bookmarks):
                mongo_db.photo_reactions.insert_one({
                    "photo_id": photo_id, "user_id": f"fake-user-{uuid.uuid4().hex[:6]}",
                    "reaction_type": "bookmark",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })

        # p_a: 5 likes, 0 bookmarks     → should be #1
        # p_b: 2 likes, 10 bookmarks    → should be #2 (fewer likes but more bookmarks)
        # p_c: 2 likes, 3 bookmarks     → should be #3
        add_reactions(p_a["photo_id"], likes=5, bookmarks=0)
        add_reactions(p_b["photo_id"], likes=2, bookmarks=10)
        add_reactions(p_c["photo_id"], likes=2, bookmarks=3)

        r = api_client.get(f"{base_url}/api/hotels/htl_03/photos")
        assert r.status_code == 200
        photos = r.json()
        # Filter only our test photos
        ids = [p["photo_id"] for p in photos]
        assert p_a["photo_id"] in ids and p_b["photo_id"] in ids and p_c["photo_id"] in ids

        idx_a = ids.index(p_a["photo_id"])
        idx_b = ids.index(p_b["photo_id"])
        idx_c = ids.index(p_c["photo_id"])
        assert idx_a < idx_b < idx_c, f"Expected order p_a<p_b<p_c but got {[ids[idx_a], ids[idx_b], ids[idx_c]]}"

        # tiebreak on created_at desc: seed two photos with same like/bookmark and check newer first
        # p_c is newest and has same likes as p_b but fewer bookmarks — already validated above
        # Check that among photos with equal likes+bookmarks, newer beats older
        # Reset reactions to make p_b == p_c
        mongo_db.photo_reactions.delete_many({"photo_id": {"$in": [p_b["photo_id"], p_c["photo_id"]]}})
        add_reactions(p_b["photo_id"], likes=1, bookmarks=1)
        add_reactions(p_c["photo_id"], likes=1, bookmarks=1)
        r2 = api_client.get(f"{base_url}/api/hotels/htl_03/photos")
        photos2 = r2.json()
        ids2 = [p["photo_id"] for p in photos2]
        # p_c (newer) should come before p_b
        assert ids2.index(p_c["photo_id"]) < ids2.index(p_b["photo_id"])

        # cleanup
        mongo_db.photo_reactions.delete_many({"photo_id": {"$in": [p_a["photo_id"], p_b["photo_id"], p_c["photo_id"]]}})
        mongo_db.hotel_photos.delete_many({"user_id": user_id, "hotel_id": "htl_03"})
        mongo_db.uploaded_files.delete_many({"user_id": user_id})
        mongo_db.bookings.delete_many({"user_id": user_id})


# --------------- GET /api/photos/bookmarks ---------------
class TestMyBookmarks:

    def test_bookmarks_requires_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/photos/bookmarks")
        assert r.status_code == 401

    def test_bookmarks_returns_current_users_saved_photos(self, api_client, base_url, auth_headers, mongo_db, seeded_session):
        user_id = seeded_session["user_id"]
        mongo_db.bookings.delete_many({"user_id": user_id})
        mongo_db.hotel_photos.delete_many({"user_id": user_id})
        mongo_db.uploaded_files.delete_many({"user_id": user_id})
        mongo_db.photo_reactions.delete_many({"user_id": user_id})
        _seed_paid_booking(mongo_db, user_id, "htl_01")
        headers = {"Authorization": auth_headers["Authorization"]}
        # upload 2 photos and bookmark them
        pA = _upload_photo(base_url, headers, "htl_01", "TEST_bm_A")
        import time; time.sleep(0.2)
        pB = _upload_photo(base_url, headers, "htl_01", "TEST_bm_B")

        r1 = api_client.post(f"{base_url}/api/photos/{pA['photo_id']}/reactions",
                             json={"reaction_type": "bookmark"}, headers=auth_headers)
        assert r1.status_code == 200
        time.sleep(0.2)
        r2 = api_client.post(f"{base_url}/api/photos/{pB['photo_id']}/reactions",
                             json={"reaction_type": "bookmark"}, headers=auth_headers)
        assert r2.status_code == 200

        r_get = api_client.get(f"{base_url}/api/photos/bookmarks", headers=auth_headers)
        assert r_get.status_code == 200
        data = r_get.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        ids = [p["photo_id"] for p in data]
        assert pA["photo_id"] in ids and pB["photo_id"] in ids
        # reverse chronological → pB (more recently bookmarked) before pA
        assert ids.index(pB["photo_id"]) < ids.index(pA["photo_id"])
        # each has url field
        for p in data:
            assert "url" in p and p["url"].startswith("/api/files/")

        # cleanup
        mongo_db.photo_reactions.delete_many({"user_id": user_id})
        mongo_db.hotel_photos.delete_many({"user_id": user_id})
        mongo_db.uploaded_files.delete_many({"user_id": user_id})
        mongo_db.bookings.delete_many({"user_id": user_id})
