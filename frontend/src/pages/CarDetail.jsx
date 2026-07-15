import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, addDays, differenceInDays } from "date-fns";
import { Users, Gauge, Sparkles, ArrowRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [dates, setDates] = useState({ from: new Date(), to: addDays(new Date(), 2) });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/cars/${id}`).then((r) => setCar(r.data)).catch(() => toast.error("Car not found"));
  }, [id]);

  if (!car) return <div className="pt-32 text-center text-white/60">Loading…</div>;

  const days = Math.max(1, differenceInDays(dates.to || addDays(dates.from, 1), dates.from));
  const subtotal = car.price * days;
  const taxes = Math.round(subtotal * 0.10);
  const total = subtotal + taxes;

  const book = () => {
    if (!user) {
      toast.info("Sign in to complete your rental");
      const redirect = window.location.origin + "/auth/callback";
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
      return;
    }
    const payload = {
      item_type: "car",
      item_id: car.id,
      destination: car.destination,
      start_date: format(dates.from, "yyyy-MM-dd"),
      end_date: format(dates.to || addDays(dates.from, 1), "yyyy-MM-dd"),
      guests: car.seats,
      total_amount: total,
    };
    navigate("/checkout", { state: { payload, item: car, itemType: "car", nights: days } });
  };

  return (
    <div className="pt-24 pb-20 max-w-[1400px] mx-auto px-6 lg:px-10" data-testid="car-detail-page">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">{car.destination}</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tighter leading-none">{car.name}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/70">
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {car.seats} seats</span>
            <span className="flex items-center gap-1"><Gauge className="w-4 h-4" /> {car.transmission}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">{car.type}</span>
          </div>

          <div className="mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
            <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
          </div>

          <div className="mt-10">
            <h2 className="font-display font-semibold text-2xl mb-3">Included</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {car.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF4500]" /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit bg-[#141414] border border-white/10 rounded-2xl p-6" data-testid="car-booking-card">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-display font-bold text-3xl">₹{car.price.toLocaleString("en-IN")}</span>
              <span className="text-white/50 text-sm"> / day</span>
            </div>
          </div>

          <div className="mt-6">
            <Popover>
              <PopoverTrigger asChild>
                <button data-testid="car-dates-btn" className="w-full text-left border border-white/15 hover:border-white/30 rounded-lg px-4 py-3 flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-[#FF4500]" />
                  <div>
                    <div className="uppercase tracking-[0.2em] text-[10px] text-white/50">Pickup — Drop</div>
                    <div className="text-sm font-medium">
                      {format(dates.from, "MMM d")} — {format(dates.to || addDays(dates.from, 1), "MMM d")}
                    </div>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="p-0 bg-[#0F0F0F] border-white/15 text-white" align="start">
                <Calendar mode="range" selected={dates} onSelect={setDates} numberOfMonths={1} className="p-3" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-6 space-y-2 text-sm border-t border-white/10 pt-4">
            <div className="flex justify-between text-white/70"><span>₹{car.price.toLocaleString("en-IN")} × {days} days</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between text-white/70"><span>Taxes & fees</span><span>₹{taxes.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between font-display font-bold text-lg pt-3 border-t border-white/10 mt-3">
              <span>Total</span><span data-testid="car-total">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <Button
            onClick={book}
            data-testid="car-book-btn"
            className="w-full mt-6 bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold h-12 rounded-full brand-glow"
          >
            Rent this ride <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </aside>
      </div>
    </div>
  );
}
