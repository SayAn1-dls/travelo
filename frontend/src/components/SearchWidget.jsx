import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Users, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const DESTS = [
  { slug: "goa", label: "Goa, India" },
  { slug: "jaipur", label: "Jaipur, India" },
  { slug: "manali", label: "Manali, India" },
  { slug: "bali", label: "Bali, Indonesia" },
  { slug: "dubai", label: "Dubai, UAE" },
  { slug: "paris", label: "Paris, France" },
];

export default function SearchWidget({ variant = "hero" }) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("goa");
  const [dates, setDates] = useState({ from: new Date(), to: new Date(Date.now() + 3 * 86400000) });
  const [guests, setGuests] = useState("2");

  const submit = () => {
    const params = new URLSearchParams({
      destination,
      start: format(dates.from, "yyyy-MM-dd"),
      end: format(dates.to || dates.from, "yyyy-MM-dd"),
      guests,
    });
    navigate(`/destinations/${destination}?${params.toString()}`);
  };

  return (
    <div
      data-testid="search-widget"
      className={`w-full bg-black/70 backdrop-blur-2xl border border-white/15 p-3 md:p-2 rounded-2xl md:rounded-full shadow-2xl grid grid-cols-1 md:grid-cols-[1.4fr_1.6fr_1fr_auto] gap-2 md:gap-0 items-stretch`}
    >
      {/* Destination */}
      <div className="flex items-center gap-3 px-5 py-3 md:py-4 md:border-r border-white/10 hover:bg-white/5 transition-colors rounded-xl md:rounded-l-full">
        <MapPin className="w-4 h-4 text-[#FF4500]" />
        <div className="flex-1">
          <div className="uppercase tracking-[0.2em] text-[10px] text-white/50 mb-1">Where</div>
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger data-testid="search-destination" className="border-0 bg-transparent px-0 h-6 focus:ring-0 focus:ring-offset-0 text-white text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0F0F0F] border-white/15 text-white">
              {DESTS.map((d) => (
                <SelectItem key={d.slug} value={d.slug} className="focus:bg-white/10">{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dates */}
      <Popover>
        <PopoverTrigger asChild>
          <button data-testid="search-dates" className="flex items-center gap-3 px-5 py-3 md:py-4 md:border-r border-white/10 text-left hover:bg-white/5 transition-colors rounded-xl md:rounded-none">
            <CalendarIcon className="w-4 h-4 text-[#FF4500]" />
            <div className="flex-1">
              <div className="uppercase tracking-[0.2em] text-[10px] text-white/50 mb-1">When</div>
              <div className="text-sm font-medium">
                {dates?.from ? format(dates.from, "MMM d") : "Add dates"} — {dates?.to ? format(dates.to, "MMM d") : "…"}
              </div>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0 bg-[#0F0F0F] border-white/15 text-white" align="start">
          <Calendar
            mode="range"
            selected={dates}
            onSelect={setDates}
            numberOfMonths={2}
            className="p-3"
          />
        </PopoverContent>
      </Popover>

      {/* Guests */}
      <div className="flex items-center gap-3 px-5 py-3 md:py-4 md:border-r border-white/10 hover:bg-white/5 transition-colors rounded-xl md:rounded-none">
        <Users className="w-4 h-4 text-[#FF4500]" />
        <div className="flex-1">
          <div className="uppercase tracking-[0.2em] text-[10px] text-white/50 mb-1">Who</div>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger data-testid="search-guests" className="border-0 bg-transparent px-0 h-6 focus:ring-0 focus:ring-offset-0 text-white text-sm font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0F0F0F] border-white/15 text-white">
              {[1,2,3,4,5,6,8].map((n) => (
                <SelectItem key={n} value={String(n)} className="focus:bg-white/10">{n} {n === 1 ? "guest" : "guests"}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search */}
      <div className="p-1 md:p-2 flex items-stretch">
        <Button
          data-testid="search-submit-btn"
          onClick={submit}
          className="h-full w-full md:w-auto px-6 md:px-8 rounded-xl md:rounded-full bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold brand-glow"
        >
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </div>
    </div>
  );
}
