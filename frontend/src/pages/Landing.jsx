import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Hotel, Car, MapPinned } from "lucide-react";
import api from "@/lib/api";
import SearchWidget from "@/components/SearchWidget";
import HotelCard from "@/components/HotelCard";
import CarCard from "@/components/CarCard";

const HERO_BG = "https://images.pexels.com/photos/7974839/pexels-photo-7974839.jpeg";

export default function Landing() {
  const [destinations, setDestinations] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/destinations"),
      api.get("/hotels"),
      api.get("/cars"),
    ]).then(([d, h, c]) => {
      setDestinations(d.data);
      setHotels(h.data.slice(0, 6));
      setCars(c.data.slice(0, 4));
    }).catch(console.error);
  }, []);

  return (
    <div data-testid="landing-page">
      {/* HERO */}
      <section className="relative min-h-[92vh] pt-16 grain overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-veil" />
        </div>
        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 pt-24 md:pt-28 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80">
              <Sparkles className="w-3 h-3 text-[#FF4500]" /> Book the whole trip in one flow
            </div>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-[88px] leading-[0.95] tracking-tighter mt-6 max-w-4xl">
              Where do you want to <span className="text-[#FF4500]">wake up</span> tomorrow?
            </h1>
            <p className="text-white/70 text-base md:text-lg mt-5 max-w-xl leading-relaxed">
              Curated hotels, road-ready rides, and hidden places nearby — put together your next escape with one search.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="mt-10 max-w-5xl">
            <SearchWidget />
          </motion.div>

          {/* trust strip */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-2xl">
            {[
              { k: "1M+", v: "Happy travellers" },
              { k: "4.8/5", v: "Guest rating" },
              { k: "50+", v: "Destinations" },
            ].map((s) => (
              <div key={s.k} className="border-l border-white/15 pl-4">
                <div className="font-display font-bold text-2xl">{s.k}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE PILLARS BENTO */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Everything in one flow</div>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Stay. Drive. Explore.</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <Link to="/hotels" className="group md:col-span-7 relative aspect-[16/9] md:aspect-auto md:min-h-[420px] overflow-hidden rounded-2xl border border-white/10 card-lift" data-testid="pillar-hotels">
            <img src="https://images.unsplash.com/photo-1629140727571-9b5c6f6267b4" alt="Hotels" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105" style={{ transition: "transform 0.6s ease" }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-black/40 to-transparent" />
            <div className="relative h-full p-8 md:p-12 flex flex-col justify-end">
              <Hotel className="w-8 h-8 text-[#FF4500]" />
              <h3 className="font-display font-bold text-3xl md:text-5xl mt-3">Boutique Hotels</h3>
              <p className="text-white/70 mt-2 max-w-md">Handpicked stays — from cliffside villas to heritage havelis.</p>
              <div className="mt-5 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/80 group-hover:text-[#FF4500]">Browse hotels <ArrowRight className="w-4 h-4" /></div>
            </div>
          </Link>
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link to="/cars" className="group flex-1 relative min-h-[200px] overflow-hidden rounded-2xl border border-white/10 card-lift" data-testid="pillar-cars">
              <img src="https://images.pexels.com/photos/16189183/pexels-photo-16189183.jpeg" alt="Cars" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105" style={{ transition: "transform 0.6s ease" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
                <Car className="w-7 h-7 text-[#FF4500]" />
                <h3 className="font-display font-bold text-2xl md:text-3xl mt-2">Rent a Ride</h3>
                <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/80 group-hover:text-[#FF4500]">Explore fleet <ArrowRight className="w-3.5 h-3.5" /></div>
              </div>
            </Link>
            <Link to="/destinations" className="group flex-1 relative min-h-[200px] overflow-hidden rounded-2xl border border-white/10 card-lift" data-testid="pillar-places">
              <img src="https://images.pexels.com/photos/34124122/pexels-photo-34124122.jpeg" alt="Places" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105" style={{ transition: "transform 0.6s ease" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative h-full p-6 md:p-8 flex flex-col justify-end">
                <MapPinned className="w-7 h-7 text-[#FF4500]" />
                <h3 className="font-display font-bold text-2xl md:text-3xl mt-2">Nearby Places</h3>
                <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/80 group-hover:text-[#FF4500]">Discover attractions <ArrowRight className="w-3.5 h-3.5" /></div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Trending</div>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Where the world is going</h2>
          </div>
          <Link to="/destinations" className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 hover:text-white">All destinations <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((d, i) => (
            <Link key={d.slug} to={`/destinations/${d.slug}`} data-testid={`dest-tile-${d.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 card-lift">
              <img src={d.image} alt={d.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110" style={{ transition: "transform 0.6s ease" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent" />
              <div className="relative h-full p-4 flex flex-col justify-end">
                <div className="font-display font-bold text-xl">{d.name}</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">{d.country}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOTELS PREVIEW */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Handpicked</div>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Stays worth waking up in</h2>
          </div>
          <Link to="/hotels" className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 hover:text-white">All hotels <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((h) => <HotelCard key={h.id} hotel={h} />)}
        </div>
      </section>

      {/* CARS PREVIEW */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Ready to roll</div>
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Choose your ride</h2>
          </div>
          <Link to="/cars" className="hidden md:inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 hover:text-white">All cars <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cars.map((c) => <CarCard key={c.id} car={c} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#141414] p-10 md:p-16">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF4500]/20 rounded-full blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">One search. Whole trip.</div>
              <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-[1.05]">Your next adventure is one click away.</h2>
              <p className="text-white/70 mt-5 max-w-md">Book a hotel, add a car, and discover attractions nearby — Travelo stitches it all together with a secure Razorpay checkout.</p>
            </div>
            <div className="flex md:justify-end gap-3">
              <Link to="/hotels" data-testid="cta-hotels-btn" className="inline-flex items-center gap-2 rounded-full bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold px-6 py-3 brand-glow">Book a stay <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/cars" data-testid="cta-cars-btn" className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:border-white/50 px-6 py-3">Rent a car</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
