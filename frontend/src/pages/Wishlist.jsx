import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import HotelCard from "@/components/HotelCard";
import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function Wishlist() {
  const { user, loading } = useAuth();
  const { ids } = useWishlist();
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    if (!user) { setHotels([]); return; }
    api.get("/wishlist").then((r) => setHotels(r.data.hotels || []));
  }, [user, ids]);

  if (loading) return <div className="pt-32 text-center text-white/60">Loading…</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-6 text-center" data-testid="wishlist-unauth">
        <Heart className="w-10 h-10 text-[#FF4500] mx-auto mb-4" />
        <h1 className="font-display font-bold text-3xl tracking-tighter">Save the places you love</h1>
        <p className="text-white/60 mt-3">Sign in to keep a running list of hotels for later.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-[1400px] mx-auto px-6 lg:px-10" data-testid="wishlist-page">
      <div className="mb-10">
        <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Saved for later</div>
        <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tighter">Wishlist</h1>
      </div>

      {hotels.length === 0 ? (
        <div className="bg-[#141414] border border-white/10 rounded-2xl py-16 text-center">
          <Heart className="w-10 h-10 text-white/40 mx-auto mb-4" />
          <div className="text-white/70">Nothing saved yet.</div>
          <Link to="/hotels" className="text-[#FF4500] mt-4 inline-block hover:underline">Browse hotels →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((h) => <HotelCard key={h.id} hotel={h} />)}
        </div>
      )}
    </div>
  );
}
