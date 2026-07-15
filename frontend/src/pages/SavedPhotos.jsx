import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Heart, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function SavedPhotos() {
  const { user, loading } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [ready, setReady] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/photos/bookmarks");
      setPhotos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setReady(true);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const react = async (photo, kind) => {
    // optimistic
    setPhotos((prev) => prev.map((p) => {
      if (p.photo_id !== photo.photo_id) return p;
      const keyMy = kind === "like" ? "my_liked" : "my_bookmarked";
      const keyCount = kind === "like" ? "like_count" : "bookmark_count";
      const active = !p[keyMy];
      return { ...p, [keyMy]: active, [keyCount]: p[keyCount] + (active ? 1 : -1) };
    }));
    if (lightbox && lightbox.photo_id === photo.photo_id) {
      const keyMy = kind === "like" ? "my_liked" : "my_bookmarked";
      const keyCount = kind === "like" ? "like_count" : "bookmark_count";
      const active = !lightbox[keyMy];
      setLightbox({ ...lightbox, [keyMy]: active, [keyCount]: lightbox[keyCount] + (active ? 1 : -1) });
    }
    try {
      const { data } = await api.post(`/photos/${photo.photo_id}/reactions`, { reaction_type: kind });
      // if unbookmarked, remove from this page immediately
      if (kind === "bookmark" && !data.active) {
        setPhotos((prev) => prev.filter((p) => p.photo_id !== photo.photo_id));
        if (lightbox && lightbox.photo_id === photo.photo_id) setLightbox(null);
        toast("Removed from saved photos");
      } else {
        setPhotos((prev) => prev.map((p) => (p.photo_id === photo.photo_id
          ? { ...p, like_count: data.like_count, bookmark_count: data.bookmark_count, [`my_${kind === "like" ? "liked" : "bookmarked"}`]: data.active }
          : p)));
      }
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Something went wrong");
      await load();
    }
  };

  if (loading) return <div className="pt-32 text-center text-white/60">Loading…</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-6 text-center" data-testid="saved-photos-unauth">
        <Bookmark className="w-10 h-10 text-[#FF4500] mx-auto mb-4" />
        <h1 className="font-display font-bold text-3xl tracking-tighter">Save shots you love</h1>
        <p className="text-white/60 mt-3">Sign in to bookmark traveller photos and revisit them here.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-[1400px] mx-auto px-6 lg:px-10" data-testid="saved-photos-page">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Your library</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tighter">Saved photos</h1>
          <p className="text-white/60 mt-3 max-w-lg">Every shot you've bookmarked across all hotels, in one gallery.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
          <Bookmark className="w-3.5 h-3.5" /> {photos.length} saved
        </div>
      </div>

      {ready && photos.length === 0 ? (
        <div className="bg-[#141414] border border-white/10 rounded-2xl py-16 text-center" data-testid="saved-photos-empty">
          <Bookmark className="w-10 h-10 text-white/40 mx-auto mb-4" />
          <div className="text-white/70">Nothing saved yet.</div>
          <Link to="/hotels" className="text-[#FF4500] mt-4 inline-block hover:underline">Browse hotels and bookmark photos →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((p) => (
            <div key={p.photo_id} data-testid={`saved-photo-${p.photo_id}`} className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-white/10 card-lift">
              <button onClick={() => setLightbox(p)} className="absolute inset-0 w-full h-full">
                <img src={`${BACKEND_URL}${p.url}`} alt={p.caption || ""} className="w-full h-full object-cover group-hover:scale-110" style={{ transition: "transform 0.4s ease" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              </button>

              <div className="absolute top-3 left-3 pointer-events-none">
                <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] bg-black/70 border border-white/15 rounded-full px-2.5 py-1 text-white">
                  <MapPin className="w-3 h-3 text-[#FF4500]" /> {p.hotel_destination}
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between pointer-events-none">
                <div className="min-w-0 pointer-events-auto">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">{p.user_name}</div>
                  <Link to={`/hotels/${p.hotel_id}`} className="text-sm text-white font-medium truncate block hover:text-[#FF4500]" data-testid={`saved-hotel-link-${p.photo_id}`}>
                    {p.hotel_name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    data-testid={`saved-like-btn-${p.photo_id}`}
                    onClick={(e) => { e.stopPropagation(); react(p, "like"); }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md border text-[11px] font-medium transition-colors ${p.my_liked ? "bg-[#FF4500] text-black border-[#FF4500]" : "bg-black/60 text-white border-white/20 hover:border-white/40"}`}
                  >
                    <Heart className={`w-3 h-3 ${p.my_liked ? "fill-black text-black" : ""}`} strokeWidth={2} />
                    <span>{p.like_count}</span>
                  </button>
                  <button
                    data-testid={`saved-remove-btn-${p.photo_id}`}
                    onClick={(e) => { e.stopPropagation(); react(p, "bookmark"); }}
                    className="w-7 h-7 rounded-full backdrop-blur-md border border-white/20 bg-black/60 hover:bg-red-500/30 hover:border-red-400/50 flex items-center justify-center"
                    title="Remove from saved"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          data-testid="saved-lightbox"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={`${BACKEND_URL}${lightbox.url}`} alt="" className="w-full max-h-[70vh] object-contain rounded-xl" />
            <div className="mt-4 flex items-center gap-3">
              {lightbox.user_picture && <img src={lightbox.user_picture} alt="" className="w-9 h-9 rounded-full border border-white/20" />}
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{lightbox.user_name}</div>
                <Link to={`/hotels/${lightbox.hotel_id}`} className="text-sm text-white/60 hover:text-[#FF4500] truncate block">
                  {lightbox.hotel_name} · {lightbox.hotel_destination}
                </Link>
                {lightbox.caption && <div className="text-white/70 text-sm mt-1">{lightbox.caption}</div>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => react(lightbox, "like")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${lightbox.my_liked ? "bg-[#FF4500] text-black border-[#FF4500]" : "bg-white/5 text-white border-white/20 hover:border-white/40"}`}
                >
                  <Heart className={`w-4 h-4 ${lightbox.my_liked ? "fill-black" : ""}`} />
                  <span className="text-sm font-medium">{lightbox.like_count}</span>
                </button>
                <button
                  onClick={() => react(lightbox, "bookmark")}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border transition-colors bg-white text-black border-white"
                  data-testid="saved-lightbox-unsave"
                >
                  <Bookmark className="w-4 h-4 fill-black" />
                  <span className="text-sm font-medium">Saved</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
