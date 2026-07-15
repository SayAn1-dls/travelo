import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Shield, ArrowRight, CheckCircle2, Mail, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const state = location.state || {};
  const { payload, item, itemType, nights, bundle, items } = state;
  const isBundle = Boolean(bundle);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    if (!payload && !bundle) navigate("/");
  }, [payload, bundle, navigate]);

  if (!payload && !bundle) return null;

  const summary = isBundle ? bundle : payload;
  const displayItems = isBundle ? items : [{ ...item, item_type: itemType, subtotal: payload.total_amount }];

  const startPayment = async () => {
    setLoading(true);
    try {
      const url = isBundle ? "/bookings/bundle" : "/bookings";
      const body = isBundle ? bundle : payload;
      const { data } = await api.post(url, body);
      const { booking, razorpay: rz } = data;

      if (rz.demo_mode) {
        toast.info("Demo mode: simulating Razorpay payment…");
        const fakePaymentId = `pay_demo_${Math.random().toString(36).slice(2, 14)}`;
        const { data: verified } = await api.post("/payments/verify", {
          booking_id: booking.booking_id,
          razorpay_order_id: rz.order_id,
          razorpay_payment_id: fakePaymentId,
          razorpay_signature: "demo_signature",
        });
        setSuccess(verified.booking);
        setEmailStatus(verified.email);
        toast.success("Payment successful (demo)");
      } else {
        const ok = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
        if (!ok) throw new Error("Failed to load Razorpay");
        const rzp = new window.Razorpay({
          key: rz.key_id,
          amount: rz.amount,
          currency: rz.currency,
          order_id: rz.order_id,
          name: "Travelo",
          description: `Booking ${booking.booking_id}`,
          prefill: { name: user?.name || "", email: user?.email || "" },
          theme: { color: "#FF4500" },
          handler: async (resp) => {
            const { data: verified } = await api.post("/payments/verify", {
              booking_id: booking.booking_id,
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
            });
            setSuccess(verified.booking);
            setEmailStatus(verified.email);
            toast.success("Payment successful");
          },
          modal: { ondismiss: () => toast.info("Payment cancelled") },
        });
        rzp.open();
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-32 pb-24 max-w-2xl mx-auto px-6 text-center" data-testid="checkout-success">
        <CheckCircle2 className="w-16 h-16 text-[#FF4500] mx-auto mb-6" />
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">Booking confirmed</h1>
        <p className="text-white/70 mt-4">Reference: <span className="text-white font-mono">{success.booking_id}</span></p>

        {emailStatus && (
          <div
            data-testid="email-status"
            className="mt-6 inline-flex items-center gap-2 text-sm text-white/80 bg-white/5 border border-white/10 rounded-full px-4 py-2"
          >
            <Mail className="w-4 h-4 text-[#FF4500]" />
            {emailStatus.status === "sent" && <span>Confirmation email sent to {emailStatus.to}</span>}
            {emailStatus.status === "mocked" && <span>Email prepared (mock mode) for {emailStatus.to}</span>}
            {emailStatus.status === "failed" && <span>Email queue failed — we&apos;ll retry shortly</span>}
          </div>
        )}

        <div className="mt-8 bg-[#141414] border border-white/10 rounded-2xl p-6 text-left">
          {success.is_bundle && success.items ? (
            <div className="space-y-4">
              <div className="uppercase tracking-[0.2em] text-[10px] text-[#FF4500] flex items-center gap-2"><Package className="w-3 h-3" /> Trip bundle</div>
              {success.items.map((it, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <img src={it.image} alt={it.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div>
                    <div className="uppercase tracking-[0.2em] text-[10px] text-white/50">{it.item_type}</div>
                    <div className="font-display font-semibold text-lg">{it.name}</div>
                  </div>
                  <div className="ml-auto font-medium">₹{it.subtotal.toLocaleString("en-IN")}</div>
                </div>
              ))}
              <div className="text-white/60 text-sm">{success.start_date} → {success.end_date}</div>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
              <img src={success.item_image} alt={success.item_name} className="w-24 h-24 object-cover rounded-lg" />
              <div>
                <div className="uppercase tracking-[0.2em] text-[10px] text-white/50">{success.item_type}</div>
                <div className="font-display font-semibold text-xl">{success.item_name}</div>
                <div className="text-white/60 text-sm">{success.start_date} → {success.end_date}</div>
              </div>
            </div>
          )}
          <div className="border-t border-white/10 mt-5 pt-4 flex justify-between font-display font-bold text-lg">
            <span>Paid</span><span>₹{success.total_amount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <Button data-testid="checkout-view-bookings-btn" onClick={() => navigate("/my-bookings")} className="rounded-full bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold">View my trips <ArrowRight className="w-4 h-4 ml-2" /></Button>
          <Button variant="outline" onClick={() => navigate("/")} className="rounded-full border-white/20 hover:border-white/50 bg-transparent">Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 max-w-3xl mx-auto px-6 lg:px-10" data-testid="checkout-page">
      <div className="uppercase tracking-[0.2em] text-xs text-[#FF4500] mb-3">Almost there</div>
      <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tighter">Review & pay</h1>
      {isBundle && (
        <div className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#FF4500] bg-[#FF4500]/10 border border-[#FF4500]/30 rounded-full px-3 py-1">
          <Package className="w-3 h-3" /> Trip bundle · {displayItems.length} items
        </div>
      )}

      <div className="mt-10 bg-[#141414] border border-white/10 rounded-2xl overflow-hidden">
        {displayItems.map((it, i) => (
          <div key={i} className={`flex flex-col sm:flex-row ${i > 0 ? "border-t border-white/10" : ""}`}>
            <img src={it.image} alt={it.name} className="w-full sm:w-40 h-32 sm:h-auto object-cover" />
            <div className="p-5 flex-1">
              <div className="uppercase tracking-[0.2em] text-[10px] text-white/50">{it.item_type} · {summary.destination}</div>
              <div className="font-display font-semibold text-xl mt-1">{it.name}</div>
              <div className="text-white/60 text-sm mt-2">
                {summary.start_date} → {summary.end_date} · {summary.guests} {summary.guests === 1 ? "guest" : "guests"} · {nights} nights
              </div>
            </div>
          </div>
        ))}
        <div className="border-t border-white/10 p-6 space-y-2 text-sm">
          <div className="flex justify-between text-white/70"><span>Base fare</span><span>₹{(summary.total_amount - Math.round(summary.total_amount * 0.12 / 1.12)).toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between text-white/70"><span>Taxes & fees</span><span>₹{Math.round(summary.total_amount * 0.12 / 1.12).toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between font-display font-bold text-xl pt-3 border-t border-white/10 mt-3">
            <span>Total</span><span data-testid="checkout-total">₹{summary.total_amount.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
        <Shield className="w-4 h-4 text-[#FF4500]" /> Payments are processed securely by Razorpay
      </div>

      <Button
        data-testid="checkout-pay-btn"
        disabled={loading}
        onClick={startPayment}
        className="w-full mt-6 bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold h-14 rounded-full brand-glow text-base"
      >
        {loading ? "Processing…" : `Pay ₹${summary.total_amount.toLocaleString("en-IN")}`} <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
