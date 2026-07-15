import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format, differenceInDays, addDays } from "date-fns";
import { Star, MapPin, Sparkles, CalendarIcon, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ReviewsSection from "@/components/ReviewsSection";
import BundleUpsell from "@/components/BundleUpsell";

export default function HotelDetail() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [dates, setDates] = useState({ from: new Date(), to: addDays(new Date(), 3) });
  const [guests, setGuests] = useState("2");
  const [bundleCar, setBundleCar] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    api.get(`/hotels/${id}`).then((r) => setHotel(r.data)).catch(() => toast.error("Hotel not found"));
    api.get(`/hotels/${id}/reviews`).then((r) => setReviews(r.data));
  }, [id]);

  const nights = useMemo(
    () => (hotel ? Math.max(1, differenceInDays(dates.to || addDays(dates.from, 1), dates.from)) : 0),
    [dates, hotel]
  );

  if (!hotel) return <div className="pt-32 text-center text-white/60">Loading…</div>;

  const hotelSubtotal = hotel.price * nights;
  const carSubtotal = bundleCar ? bundleCar.price * nights : 0;
  const subtotal = hotelSubtotal + carSubtotal;
  const taxes = Math.round(subtotal * 0.12);
  const total = subtotal + taxes;

  const book = () => {
    if (!user) {
      toast.info("Sign in to complete your booking");
      const redirect = window.location.origin + "/auth/callback";
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
      return;
    }

    const start = format(dates.from, "yyyy-MM-dd");
    const end = format(dates.to || addDays(dates.from, 1), "yyyy-MM-dd");

    if (bundleCar) {
      const bundle = {
        items: [
          { item_type: "hotel", item_id: hotel.id, quantity: nights },
          { item_type: "car", item_id: bundleCar.id, quantity: nights },
        ],
        destination: hotel.destination,
        start_date: start,
        end_date: end,
        guests: Number(guests),
        total_amount: total,
      };
      navigate("/checkout", {
        state: {
          bundle,
          nights,
          items: [
            { ...hotel, item_type: "hotel", subtotal: hotelSubtotal + Math.round(hotelSubtotal * 0.12) },
            { ...bundleCar, item_type: "car", subtotal: carSubtotal + Math.round(carSubtotal * 0.12) },
          ],
        },
      });
      return;
    }

    const payload = {
      item_type: "hotel",
      item_id: hotel.id,
      destination: hotel.destination,
      start_date: start,
      end_date: end,
      guests: Number(guests),
      total_amount: total,
    };
    navigate("/checkout", { state: { payload, item: hotel, itemType: "hotel", nights } });
  };

  return (
    <div className="pt-24 pb-20 max-w-[1400px] mx-auto px-6 lg:px-10" data-testid="hotel-detail-page">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10">
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] flex items-center gap-2 mb-3">
            <MapPin className="w-3 h-3" /> {hotel.destination}
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tighter leading-none">{hotel.name}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <Star className="w-3.5 h-3.5 fill-[#FF4500] text-[#FF4500]" /> {hotel.rating}
            </div>
            <div className="text-white/60">{hotel.reviews} reviews</div>
          </div>

          <div className="mt-8 aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
            <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="font-display font-semibold text-2xl mb-3">About the stay</h2>
              <p className="text-white/70 leading-relaxed">{hotel.description}</p>
            </div>
            <div>
              <h2 className="font-display font-semibold text-2xl mb-3">Amenities</h2>
              <div className="grid grid-cols-2 gap-3">
                {hotel.amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-white/80 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF4500]" /> {a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <ReviewsSection data={reviews} />
        </div>

        {/* Booking widget */}
        <aside className="lg:sticky lg:top-24 h-fit bg-[#141414] border border-white/10 rounded-2xl p-6" data-testid="hotel-booking-card">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-display font-bold text-3xl">₹{hotel.price.toLocaleString("en-IN")}</span>
              <span className="text-white/50 text-sm"> / night</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Popover>
              <PopoverTrigger asChild>
                <button data-testid="hotel-dates-btn" className="w-full text-left border border-white/15 hover:border-white/30 rounded-lg px-4 py-3 flex items-center gap-3">
                  <CalendarIcon className="w-4 h-4 text-[#FF4500]" />
                  <div>
                    <div className="uppercase tracking-[0.2em] text-[10px] text-white/50">Check-in — Check-out</div>
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

            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger data-testid="hotel-guests-select" className="bg-transparent border-white/15 hover:border-white/30 h-auto py-3 px-4">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#FF4500]" />
                  <div className="text-left">
                    <div className="uppercase tracking-[0.2em] text-[10px] text-white/50">Guests</div>
                    <div className="text-sm font-medium">{guests} {guests === "1" ? "guest" : "guests"}</div>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[#0F0F0F] border-white/15 text-white">
                {[1,2,3,4,5,6,8].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Bundle add-a-car */}
          <BundleUpsell
            destination={hotel.destination}
            days={nights}
            selectedCar={bundleCar}
            onChange={setBundleCar}
          />

          <div className="mt-6 space-y-2 text-sm border-t border-white/10 pt-4">
            <div className="flex justify-between text-white/70"><span>Hotel · ₹{hotel.price.toLocaleString("en-IN")} × {nights} nights</span><span>₹{hotelSubtotal.toLocaleString("en-IN")}</span></div>
            {bundleCar && (
              <div className="flex justify-between text-white/70"><span>Car · {bundleCar.name} × {nights}d</span><span>₹{carSubtotal.toLocaleString("en-IN")}</span></div>
            )}
            <div className="flex justify-between text-white/70"><span>Taxes & fees</span><span>₹{taxes.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between font-display font-bold text-lg pt-3 border-t border-white/10 mt-3">
              <span>Total</span><span data-testid="hotel-total">₹{total.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <Button
            onClick={book}
            data-testid="hotel-book-btn"
            className="w-full mt-6 bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold h-12 rounded-full brand-glow"
          >
            {bundleCar ? "Reserve trip bundle" : "Reserve"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <div className="text-[11px] text-white/40 text-center mt-3">You won&apos;t be charged yet. Secure Razorpay checkout on next step.</div>
        </aside>
      </div>
    </div>
  );
}
