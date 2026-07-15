import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Star, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import HotelCard from "@/components/HotelCard";
import CarCard from "@/components/CarCard";

export default function Destination() {
  const { slug } = useParams();
  const [dest, setDest] = useState(null);
  const [places, setPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);
  const [placesSource, setPlacesSource] = useState("");

  useEffect(() => {
    if (!slug) return;
    Promise.all([
      api.get(`/destinations/${slug}`),
      api.post(`/places/nearby`, { destination: slug }),
      api.get(`/hotels?destination=${slug}`),
      api.get(`/cars?destination=${slug}`),
    ]).then(([d, p, h, c]) => {
      setDest(d.data);
      setPlaces(p.data.places || []);
      setPlacesSource(p.data.source || "");
      setHotels(h.data);
      setCars(c.data);
    });
  }, [slug]);

  if (!dest) return <div className="pt-32 text-center text-white/60">Loading…</div>;

  return (
    <div data-testid="destination-page">
      {/* Hero */}
      <section className="relative min-h-[70vh] pt-16 grain">
        <div className="absolute inset-0">
          <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-veil" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 pt-24 pb-16 min-h-[70vh] flex flex-col justify-end">
          <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] flex items-center gap-2 mb-4">
            <MapPin className="w-3 h-3" /> {dest.country}
          </div>
          <h1 className="font-display font-bold text-6xl md:text-8xl tracking-tighter leading-[0.9]">{dest.name}</h1>
          <p className="text-white/80 text-xl mt-4 max-w-xl">{dest.tagline}</p>
        </div>
      </section>

      {/* Nearby places */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Best places to visit nearby</div>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Attractions & experiences</h2>
          </div>
          {placesSource === "google" && (
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 border border-white/10 rounded-full px-3 py-1">Powered by Google Places</div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {places.map((p, i) => (
            <div key={i} data-testid={`place-card-${i}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 card-lift">
              <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110" style={{ transition: "transform 0.6s ease" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="relative h-full p-5 flex flex-col justify-end">
                <div className="uppercase tracking-[0.2em] text-[10px] text-white/70 mb-1">{p.type}</div>
                <div className="font-display font-semibold text-xl leading-tight">{p.name}</div>
                {p.rating && (
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <Star className="w-3.5 h-3.5 fill-[#FF4500] text-[#FF4500]" /> {p.rating}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hotels in destination */}
      {hotels.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Stay in {dest.name}</div>
              <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Hotels & retreats</h2>
            </div>
            <Link to={`/hotels?destination=${slug}`} className="text-sm uppercase tracking-[0.2em] text-white/70 hover:text-white inline-flex items-center gap-2">All hotels <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((h) => <HotelCard key={h.id} hotel={h} />)}
          </div>
        </section>
      )}

      {/* Cars in destination */}
      {cars.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Ride around {dest.name}</div>
              <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Cars available</h2>
            </div>
            <Link to={`/cars?destination=${slug}`} className="text-sm uppercase tracking-[0.2em] text-white/70 hover:text-white inline-flex items-center gap-2">All cars <ArrowRight className="w-4 h-4" /></Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        </section>
      )}
    </div>
  );
}
