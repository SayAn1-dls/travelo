import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import api from "@/lib/api";

export default function Destinations() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/destinations").then(r => setItems(r.data)); }, []);

  return (
    <div className="pt-24 pb-20 max-w-[1400px] mx-auto px-6 lg:px-10" data-testid="destinations-index-page">
      <div className="mb-10">
        <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Around the world</div>
        <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tighter">Destinations</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((d) => (
          <Link key={d.slug} to={`/destinations/${d.slug}`} data-testid={`dest-card-${d.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 card-lift">
            <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110" style={{ transition: "transform 0.6s ease" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="relative h-full p-6 flex flex-col justify-end">
              <div className="uppercase tracking-[0.2em] text-[10px] text-white/70">{d.country}</div>
              <div className="font-display font-bold text-3xl mt-1">{d.name}</div>
              <div className="text-white/70 mt-1">{d.tagline}</div>
              <div className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/80 group-hover:text-[#FF4500]">
                Explore <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
