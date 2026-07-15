import { useEffect, useState } from "react";
import { Car as CarIcon, Check, Users } from "lucide-react";
import api from "@/lib/api";

export default function BundleUpsell({ destination, days, selectedCar, onChange }) {
  const [cars, setCars] = useState([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!destination) return;
    api.get(`/cars?destination=${destination}`).then((r) => setCars(r.data));
  }, [destination]);

  useEffect(() => {
    if (!enabled) onChange(null);
  }, [enabled, onChange]);

  if (cars.length === 0) return null;

  return (
    <div className="mt-6 border border-white/15 rounded-xl overflow-hidden" data-testid="bundle-upsell">
      <button
        data-testid="bundle-toggle-btn"
        onClick={() => setEnabled((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
      >
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${enabled ? "bg-[#FF4500] border-[#FF4500]" : "border-white/30"}`}>
          {enabled && <Check className="w-3.5 h-3.5 text-black" />}
        </div>
        <CarIcon className="w-4 h-4 text-[#FF4500]" />
        <div className="flex-1">
          <div className="text-sm font-medium">Add a car to this trip</div>
          <div className="text-xs text-white/50">Bundle a ride for the same dates — one checkout, one confirmation.</div>
        </div>
      </button>

      {enabled && (
        <div className="border-t border-white/10 p-3 space-y-2 max-h-64 overflow-y-auto">
          {cars.map((c) => {
            const isSel = selectedCar?.id === c.id;
            return (
              <button
                key={c.id}
                data-testid={`bundle-car-${c.id}`}
                onClick={() => onChange(isSel ? null : c)}
                className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${isSel ? "border-[#FF4500] bg-[#FF4500]/10" : "border-white/10 hover:border-white/20 bg-black/20"}`}
              >
                <img src={c.image} alt={c.name} className="w-16 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.name}</div>
                  <div className="text-[11px] text-white/50 flex items-center gap-2 mt-0.5">
                    <span className="uppercase tracking-wider">{c.type}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {c.seats}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-sm">₹{(c.price * days).toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-white/40">₹{c.price.toLocaleString("en-IN")} × {days}d</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
