import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/lib/api";
import CarCard from "@/components/CarCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Cars() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [params] = useSearchParams();
  const destination = params.get("destination") || "";

  useEffect(() => {
    const query = new URLSearchParams();
    if (destination) query.append("destination", destination);
    if (q) query.append("q", q);
    api.get(`/cars?${query.toString()}`).then((r) => setItems(r.data));
  }, [q, destination]);

  return (
    <div className="pt-24 pb-20 max-w-[1400px] mx-auto px-6 lg:px-10" data-testid="cars-page">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Wheels for every road</div>
          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tighter">Cars & rides</h1>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            data-testid="cars-search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cars…"
            className="pl-11 bg-[#141414] border-white/15 h-12 rounded-full text-white placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((c) => <CarCard key={c.id} car={c} />)}
      </div>
    </div>
  );
}
