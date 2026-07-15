import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;

    if (!sessionId) {
      navigate("/");
      return;
    }

    (async () => {
      try {
        const { data } = await api.post("/auth/session", null, {
          headers: { "X-Session-ID": sessionId },
        });
        setUser(data.user);
        // Clear the hash from URL
        window.history.replaceState({}, "", window.location.pathname);
        toast.success(`Welcome, ${data.user.name || data.user.email}`);
        navigate("/my-bookings", { state: { user: data.user }, replace: true });
      } catch (e) {
        console.error(e);
        toast.error("Sign-in failed");
        navigate("/", { replace: true });
      }
    })();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="auth-callback">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#FF4500] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="uppercase tracking-[0.2em] text-xs text-white/60">Signing you in…</div>
      </div>
    </div>
  );
}
