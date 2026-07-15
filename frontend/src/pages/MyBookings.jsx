import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Luggage, Package } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function MyBookings() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    api.get("/bookings/mine").then((r) => {
      setItems(r.data);
      setReady(true);
    });
  }, [user, loading]);

  if (loading) return <div className="pt-32 text-center text-white/60">Loading…</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-24 max-w-xl mx-auto px-6 text-center" data-testid="my-bookings-unauth">
        <h1 className="font-display font-bold text-3xl tracking-tighter">Sign in to see your trips</h1>
        <p className="text-white/60 mt-3">Your bookings live in your account.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-[1400px] mx-auto px-6 lg:px-10" data-testid="my-bookings-page">
      <div className="mb-10">
        <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Your journey log</div>
        <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tighter">My trips</h1>
      </div>

      {ready && items.length === 0 ? (
        <div className="bg-[#141414] border border-white/10 rounded-2xl py-16 text-center">
          <Luggage className="w-10 h-10 text-white/40 mx-auto mb-4" />
          <div className="text-white/70">No trips yet.</div>
          <Link to="/hotels" className="text-[#FF4500] mt-4 inline-block hover:underline">Book your first stay →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((b) => (
            <div key={b.booking_id} data-testid={`booking-card-${b.booking_id}`} className="bg-[#141414] border border-white/10 rounded-xl overflow-hidden flex flex-col">
              <div className="aspect-[16/10] overflow-hidden relative">
                <img src={b.item_image} alt={b.item_name} className="w-full h-full object-cover" />
                {b.is_bundle && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#FF4500] bg-black/80 border border-[#FF4500]/40 rounded-full px-2.5 py-1">
                    <Package className="w-3 h-3" /> Bundle
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/50">
                  <span>{b.is_bundle ? `Bundle · ${b.destination}` : `${b.item_type} · ${b.destination}`}</span>
                  <span className={`px-2 py-0.5 rounded-full border ${b.payment_status === "paid" ? "text-[#FF4500] border-[#FF4500]/40" : "text-white/60 border-white/20"}`}>{b.payment_status}</span>
                </div>
                <h3 className="font-display font-semibold text-lg mt-2 leading-snug">{b.item_name}</h3>

                {b.is_bundle && b.items && (
                  <div className="flex gap-2 mt-3">
                    {b.items.map((it, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-white/60 bg-white/5 border border-white/10 rounded-full px-2 py-0.5 uppercase tracking-wider">
                        <span>{it.item_type}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-white/60 text-sm mt-2">{b.start_date} → {b.end_date}</div>
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="font-display font-bold text-xl">₹{b.total_amount.toLocaleString("en-IN")}</span>
                  <span className="text-[10px] font-mono text-white/40">{b.booking_id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
