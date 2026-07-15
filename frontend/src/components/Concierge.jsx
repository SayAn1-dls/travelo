import { useState } from "react";
import { Sparkles, Sun, Utensils, Moon, Lightbulb, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

const INTEREST_OPTIONS = [
  "Beaches", "Food & Cafes", "Nightlife", "History", "Adventure",
  "Nature", "Shopping", "Photography", "Wellness", "Local Culture",
];

export default function Concierge({ destination }) {
  const [days, setDays] = useState("3");
  const [selected, setSelected] = useState(new Set(["Food & Cafes", "Photography"]));
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = (i) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i); else s.add(i);
      return s;
    });
  };

  const generate = async () => {
    setLoading(true);
    setItinerary(null);
    try {
      const { data } = await api.post("/concierge/itinerary", {
        destination_slug: destination.slug,
        days: Number(days),
        interests: [...selected],
      });
      setItinerary(data.itinerary);
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Concierge is resting — try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16" data-testid="concierge-section">
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 items-start">
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3" /> AI Concierge</div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight leading-[1.05]">Let Travelo plan your {destination.name} trip.</h2>
          <p className="text-white/60 mt-4 leading-relaxed">Tell us how long you're staying and what excites you. Our concierge (powered by Claude Sonnet 4.5) will draft a full day-by-day itinerary you can tweak.</p>

          <div className="mt-8 bg-[#141414] border border-white/10 rounded-2xl p-6 space-y-5">
            <div>
              <div className="uppercase tracking-[0.2em] text-[10px] text-white/50 mb-2">How many days?</div>
              <Select value={days} onValueChange={setDays}>
                <SelectTrigger data-testid="concierge-days-select" className="bg-black/40 border-white/15 h-11 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0F0F0F] border-white/15 text-white">
                  {[1,2,3,4,5,6,7].map(n => <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "day" : "days"}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="uppercase tracking-[0.2em] text-[10px] text-white/50 mb-2">What excites you?</div>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((i) => {
                  const active = selected.has(i);
                  return (
                    <button
                      key={i}
                      data-testid={`concierge-interest-${i.toLowerCase().replace(/\W+/g, "-")}`}
                      onClick={() => toggle(i)}
                      className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-wider border transition-colors ${active ? "bg-[#FF4500] text-black border-[#FF4500]" : "text-white/70 border-white/15 hover:border-white/40"}`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              data-testid="concierge-generate-btn"
              onClick={generate}
              disabled={loading}
              className="w-full h-12 rounded-full bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold brand-glow"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Planning…</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Craft my itinerary</>
              )}
            </Button>
          </div>
        </div>

        {/* Result */}
        <div className="min-h-[420px]" data-testid="concierge-result">
          {!itinerary && !loading && (
            <div className="h-full bg-[#141414] border border-dashed border-white/15 rounded-2xl p-10 flex items-center justify-center text-center">
              <div>
                <Sparkles className="w-8 h-8 text-[#FF4500] mx-auto mb-3" />
                <div className="text-white/60 max-w-sm mx-auto">Your custom itinerary will appear here — moment by moment, day by day.</div>
              </div>
            </div>
          )}
          {loading && (
            <div className="bg-[#141414] border border-white/10 rounded-2xl p-10 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                  <div className="h-3 w-full bg-white/5 rounded mb-2" />
                  <div className="h-3 w-4/5 bg-white/5 rounded" />
                </div>
              ))}
            </div>
          )}
          {itinerary && (
            <div className="space-y-4">
              {itinerary.summary && (
                <div className="bg-[#FF4500]/10 border border-[#FF4500]/30 rounded-2xl p-5">
                  <div className="uppercase tracking-[0.2em] text-[10px] text-[#FF4500] mb-1">Trip vibe</div>
                  <p className="text-white/90 italic">{itinerary.summary}</p>
                </div>
              )}
              {itinerary.days?.map((d, i) => (
                <article key={i} data-testid={`concierge-day-${i + 1}`} className="bg-[#141414] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="font-display font-bold text-2xl">Day {d.day || i + 1}</div>
                    {d.theme && <div className="text-xs uppercase tracking-[0.2em] text-[#FF4500]">{d.theme}</div>}
                  </div>
                  <div className="space-y-3 text-sm">
                    {d.morning && (
                      <div className="flex gap-3">
                        <Sun className="w-4 h-4 text-[#FF4500] flex-shrink-0 mt-0.5" />
                        <div><span className="uppercase tracking-wider text-[10px] text-white/40 mr-2">Morning</span><span className="text-white/85">{d.morning}</span></div>
                      </div>
                    )}
                    {d.afternoon && (
                      <div className="flex gap-3">
                        <Utensils className="w-4 h-4 text-[#FF4500] flex-shrink-0 mt-0.5" />
                        <div><span className="uppercase tracking-wider text-[10px] text-white/40 mr-2">Afternoon</span><span className="text-white/85">{d.afternoon}</span></div>
                      </div>
                    )}
                    {d.evening && (
                      <div className="flex gap-3">
                        <Moon className="w-4 h-4 text-[#FF4500] flex-shrink-0 mt-0.5" />
                        <div><span className="uppercase tracking-wider text-[10px] text-white/40 mr-2">Evening</span><span className="text-white/85">{d.evening}</span></div>
                      </div>
                    )}
                    {d.tip && (
                      <div className="flex gap-3 pt-2 border-t border-white/10 mt-3">
                        <Lightbulb className="w-4 h-4 text-[#FF4500] flex-shrink-0 mt-0.5" />
                        <div><span className="uppercase tracking-wider text-[10px] text-white/40 mr-2">Insider tip</span><span className="text-white/70 italic">{d.tip}</span></div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
