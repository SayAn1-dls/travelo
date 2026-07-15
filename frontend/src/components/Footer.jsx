import { Compass, Instagram, Twitter, Github } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white/60" data-testid="site-footer">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-md bg-[#FF4500] flex items-center justify-center">
              <Compass className="w-4 h-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">TRAVELO</span>
          </div>
          <p className="text-sm max-w-sm leading-relaxed">
            Book hotels, rent cars, and discover the most scenic places nearby — everything for your next escape in one place.
          </p>
          <div className="flex gap-3 mt-6">
            <a href="#" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-white/40"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-white/40"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-white/40"><Github className="w-4 h-4" /></a>
          </div>
        </div>
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-white/40 mb-4">Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/hotels" className="hover:text-white">Hotels</Link></li>
            <li><Link to="/cars" className="hover:text-white">Cars</Link></li>
            <li><Link to="/destinations" className="hover:text-white">Destinations</Link></li>
          </ul>
        </div>
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-white/40 mb-4">Company</div>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Support</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} Travelo — Craft your journey.
      </div>
    </footer>
  );
}
