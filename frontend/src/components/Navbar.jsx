import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, Compass } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const login = () => {
    const redirect = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
  };

  const isActive = (p) => location.pathname === p || (p !== "/" && location.pathname.startsWith(p));

  return (
    <header
      data-testid="site-navbar"
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/10"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
        <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-md bg-[#FF4500] flex items-center justify-center brand-glow">
            <Compass className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">TRAVELO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/hotels" data-testid="nav-hotels" className={`hover:text-white transition-colors ${isActive("/hotels") ? "text-white" : "text-white/60"}`}>Hotels</Link>
          <Link to="/cars" data-testid="nav-cars" className={`hover:text-white transition-colors ${isActive("/cars") ? "text-white" : "text-white/60"}`}>Cars</Link>
          <Link to="/destinations" data-testid="nav-destinations" className={`hover:text-white transition-colors ${isActive("/destinations") ? "text-white" : "text-white/60"}`}>Destinations</Link>
          {user && (
            <Link to="/wishlist" data-testid="nav-wishlist" className={`hover:text-white transition-colors ${isActive("/wishlist") ? "text-white" : "text-white/60"}`}>Wishlist</Link>
          )}
          {user && (
            <Link to="/my-bookings" data-testid="nav-bookings" className={`hover:text-white transition-colors ${isActive("/my-bookings") ? "text-white" : "text-white/60"}`}>My Trips</Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-white/70" data-testid="nav-user-name">
                {user.picture && (
                  <img src={user.picture} alt="" className="w-7 h-7 rounded-full border border-white/20" />
                )}
                <span>{user.name?.split(" ")[0] || user.email}</span>
              </div>
              <Button
                data-testid="nav-logout-btn"
                variant="ghost"
                size="sm"
                onClick={async () => { await logout(); navigate("/"); }}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </div>
          ) : (
            <Button
              data-testid="nav-login-btn"
              onClick={login}
              className="bg-[#FF4500] hover:bg-[#FF6A33] text-black font-semibold rounded-full px-5 brand-glow"
            >
              <User className="w-4 h-4 mr-1.5" /> Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
