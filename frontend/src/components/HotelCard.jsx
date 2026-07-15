import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import WishlistButton from "@/components/WishlistButton";

export default function HotelCard({ hotel, dest }) {
  return (
    <div data-testid={`hotel-card-${hotel.id}`} className="group card-lift bg-[#141414] border border-white/10 overflow-hidden rounded-xl flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105"
          style={{ transition: "transform 0.5s ease" }}
        />
        <div className="absolute top-3 left-3 backdrop-blur-md bg-black/50 border border-white/15 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-[#FF4500] text-[#FF4500]" /> {hotel.rating}
          <span className="text-white/50">({hotel.reviews})</span>
        </div>
        <div className="absolute top-3 right-3">
          <WishlistButton hotelId={hotel.id} />
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="uppercase tracking-[0.2em] text-[10px] text-white/50 flex items-center gap-1"><MapPin className="w-3 h-3" /> {dest || hotel.destination}</div>
        <h3 className="font-display font-semibold text-lg mt-2 leading-tight">{hotel.name}</h3>
        <p className="text-white/60 text-sm mt-2 line-clamp-2">{hotel.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {hotel.amenities.slice(0, 3).map((a) => (
            <span key={a} className="text-[10px] uppercase tracking-wider text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">{a}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
          <div>
            <div className="text-2xl font-display font-bold">₹{hotel.price.toLocaleString("en-IN")}</div>
            <div className="text-[11px] text-white/50">per night</div>
          </div>
          <Link to={`/hotels/${hotel.id}`}>
            <Button data-testid={`hotel-view-btn-${hotel.id}`} size="sm" className="rounded-full bg-white text-black hover:bg-[#FF4500] hover:text-black">
              View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
