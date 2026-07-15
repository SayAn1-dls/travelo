import { Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function ReviewsSection({ data }) {
  if (!data) return null;
  const { breakdown, reviews, total } = data;
  const avg = (
    Object.values(breakdown).reduce((a, b) => a + b, 0) / Object.values(breakdown).length
  ).toFixed(1);

  const labels = {
    cleanliness: "Cleanliness",
    location: "Location",
    service: "Service",
    comfort: "Comfort",
    value: "Value",
    amenities: "Amenities",
  };

  return (
    <section className="mt-14" data-testid="hotel-reviews-section">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Guest reviews</div>
          <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight">What travellers say</h2>
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-4xl flex items-center gap-2 justify-end">
            <Star className="w-6 h-6 fill-[#FF4500] text-[#FF4500]" />
            {avg}
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50 mt-1">{total.toLocaleString()} reviews</div>
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="grid md:grid-cols-3 gap-x-8 gap-y-4 bg-[#141414] border border-white/10 rounded-2xl p-6 mb-8">
        {Object.entries(breakdown).map(([k, v]) => (
          <div key={k} data-testid={`rating-bar-${k}`}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-white/80">{labels[k]}</span>
              <span className="text-white font-medium">{v.toFixed(1)}</span>
            </div>
            <Progress value={(v / 5) * 100} className="h-1.5 bg-white/10" />
          </div>
        ))}
      </div>

      {/* Reviews grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {reviews.map((r) => (
          <article key={r.id} data-testid={`review-${r.id}`} className="bg-[#141414] border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full object-cover border border-white/15" />
              <div className="flex-1">
                <div className="font-medium text-white">{r.name}</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">{r.country} · {r.date}</div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-[#FF4500] text-[#FF4500]" : "text-white/20"}`} />
                ))}
              </div>
            </div>
            <p className="text-white/70 text-sm mt-3 leading-relaxed">{r.text}</p>
            {r.photos && r.photos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {r.photos.map((p, i) => (
                  <img key={i} src={p} alt="" className="aspect-video object-cover rounded-lg border border-white/10" />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
