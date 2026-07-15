import { Link } from "react-router-dom";
import { Users, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CarCard({ car }) {
  return (
    <div data-testid={`car-card-${car.id}`} className="group card-lift bg-[#141414] border border-white/10 overflow-hidden rounded-xl flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105" style={{ transition: "transform 0.5s ease" }} />
        <div className="absolute top-3 left-3 backdrop-blur-md bg-black/50 border border-white/15 rounded-full px-3 py-1 text-xs font-medium">
          {car.type}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="uppercase tracking-[0.2em] text-[10px] text-white/50">{car.destination}</div>
        <h3 className="font-display font-semibold text-lg mt-2 leading-tight">{car.name}</h3>
        <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {car.seats}</span>
          <span className="flex items-center gap-1"><Gauge className="w-4 h-4" /> {car.transmission}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {car.features.slice(0, 3).map((f) => (
            <span key={f} className="text-[10px] uppercase tracking-wider text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{f}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <div className="text-2xl font-display font-bold">₹{car.price.toLocaleString("en-IN")}</div>
            <div className="text-[11px] text-white/50">per day</div>
          </div>
          <Link to={`/cars/${car.id}`}>
            <Button data-testid={`car-view-btn-${car.id}`} size="sm" className="rounded-full bg-white text-black hover:bg-[#FF4500] hover:text-black">Rent</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
