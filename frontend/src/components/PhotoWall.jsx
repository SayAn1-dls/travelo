import { useEffect, useState, useRef } from "react";
import { Camera, Upload, X, Heart, Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function PhotoWall({ hotelId }) {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef(null);

  const load = () => api.get(`/hotels/${hotelId}/photos`).then((r) => setPhotos(r.data));
  useEffect(() => { load(); }, [hotelId, user?.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPick = () => fileRef.current?.click();

  const onChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!user) { toast.info("Sign in and complete a stay to share photos"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("caption", caption);
      await api.post(`/hotels/${hotelId}/photos`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCaption("");
      toast.success("Photo added to the wall");
      await load();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Upload failed";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const react = async (photo, kind) => {
    if (!user) { toast.info("Sign in to react to photos"); return; }
    // optimistic update
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
      // reconcile with server counts
      setPhotos((prev) => prev.map((p) => (p.photo_id === photo.photo_id
        ? { ...p, like_count: data.like_count, bookmark_count: data.bookmark_count, [`my_${kind === "like" ? "liked" : "bookmarked"}`]: data.active }
        : p)));
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Something went wrong");
      await load();
    }
  };

  return (
    <section className="mt-14" data-testid="photo-wall-section">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Traveller photo wall</div>
          <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight">Real snapshots from real stays</h2>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
          <Camera className="w-3.5 h-3.5" /> {photos.length} photos
        </div>
      </div>

      {/* Upload row */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-[#FF4500]/15 border border-[#FF4500]/40 flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5 text-[#FF4500]" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-white/80">Share a shot from your stay</div>
            <div className="text-xs text-white/50 mt-0.5">Available to guests with a completed booking here. JPG / PNG / WEBP, up to 5MB.</div>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Say something about the moment (optional)…"
              className="mt-3 bg-black/40 border-white/15 text-white text-sm min-h-[70px] focus-visible:ring-[#FF4500]/40"
              data-testid="photo-caption-input"
              maxLength={280}
            />
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            data-testid="photo-file-input"
            onChange={onChange}
          />
          <Button
            data-testid="photo-upload-btn"
            onClick={onPick}
            disabled={uploading}
            className="rounded-full bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold self-start"
          >
            <Upload className="w-4 h-4 mr-2" /> {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </div>

      {/* Grid */}
      {photos.length === 0 ? (
        <div className="text-white/50 text-sm bg-white/[0.02] border border-dashed border-white/10 rounded-xl py-10 text-center">
          Be the first traveller to share a photo here.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((p, idx) => (
            <div
              key={p.photo_id}
              data-testid={`photo-tile-${p.photo_id}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/10 card-lift"
            >
              {idx === 0 && (p.like_count > 0 || p.bookmark_count > 0) && (
                <div className="absolute top-2 left-2 z-10 text-[9px] uppercase tracking-[0.2em] bg-[#FF4500] text-black font-bold px-2 py-0.5 rounded-full">
                  Top shot
                </div>
              )}
              <button onClick={() => setLightbox(p)} className="absolute inset-0 w-full h-full">
                <img
                  src={`${BACKEND_URL}${p.url}`}
                  alt={p.caption || "traveller photo"}
                  className="w-full h-full object-cover group-hover:scale-110"
                  style={{ transition: "transform 0.4s ease" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              </button>

              {/* Reactions overlay - always visible for context */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                <div className="text-[11px] text-white/90 max-w-[60%]">
                  <div className="font-medium truncate pointer-events-auto">{p.user_name}</div>
                </div>
                <div className="flex items-center gap-1.5 pointer-events-auto">
                  <button
                    data-testid={`photo-like-btn-${p.photo_id}`}
                    onClick={(e) => { e.stopPropagation(); react(p, "like"); }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md border text-[11px] font-medium transition-colors ${p.my_liked ? "bg-[#FF4500] text-black border-[#FF4500]" : "bg-black/60 text-white border-white/20 hover:border-white/40"}`}
                  >
                    <Heart className={`w-3 h-3 ${p.my_liked ? "fill-black text-black" : ""}`} strokeWidth={2} />
                    <span data-testid={`photo-like-count-${p.photo_id}`}>{p.like_count}</span>
                  </button>
                  <button
                    data-testid={`photo-bookmark-btn-${p.photo_id}`}
                    onClick={(e) => { e.stopPropagation(); react(p, "bookmark"); }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md border text-[11px] font-medium transition-colors ${p.my_bookmarked ? "bg-white text-black border-white" : "bg-black/60 text-white border-white/20 hover:border-white/40"}`}
                  >
                    <Bookmark className={`w-3 h-3 ${p.my_bookmarked ? "fill-black text-black" : ""}`} strokeWidth={2} />
                    <span>{p.bookmark_count}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          data-testid="photo-lightbox"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            onClick={() => setLightbox(null)}
            data-testid="photo-lightbox-close"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={`${BACKEND_URL}${lightbox.url}`} alt="" className="w-full max-h-[70vh] object-contain rounded-xl" />
            <div className="mt-4 flex items-center gap-3">
              {lightbox.user_picture && <img src={lightbox.user_picture} alt="" className="w-9 h-9 rounded-full border border-white/20" />}
              <div className="flex-1">
                <div className="text-white font-medium">{lightbox.user_name}</div>
                {lightbox.caption && <div className="text-white/70 text-sm mt-0.5">{lightbox.caption}</div>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => react(lightbox, "like")}
                  data-testid={`lightbox-like-btn`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${lightbox.my_liked ? "bg-[#FF4500] text-black border-[#FF4500]" : "bg-white/5 text-white border-white/20 hover:border-white/40"}`}
                >
                  <Heart className={`w-4 h-4 ${lightbox.my_liked ? "fill-black" : ""}`} />
                  <span className="text-sm font-medium">{lightbox.like_count}</span>
                </button>
                <button
                  onClick={() => react(lightbox, "bookmark")}
                  data-testid={`lightbox-bookmark-btn`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${lightbox.my_bookmarked ? "bg-white text-black border-white" : "bg-white/5 text-white border-white/20 hover:border-white/40"}`}
                >
                  <Bookmark className={`w-4 h-4 ${lightbox.my_bookmarked ? "fill-black" : ""}`} />
                  <span className="text-sm font-medium">{lightbox.bookmark_count}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
