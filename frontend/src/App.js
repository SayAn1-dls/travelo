import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Landing from "@/pages/Landing";
import Hotels from "@/pages/Hotels";
import HotelDetail from "@/pages/HotelDetail";
import Cars from "@/pages/Cars";
import CarDetail from "@/pages/CarDetail";
import Destinations from "@/pages/Destinations";
import Destination from "@/pages/Destination";
import Checkout from "@/pages/Checkout";
import MyBookings from "@/pages/MyBookings";
import Wishlist from "@/pages/Wishlist";
import SavedPhotos from "@/pages/SavedPhotos";
import AuthCallback from "@/pages/AuthCallback";

function AppShell() {
  const location = useLocation();
  // Handle OAuth callback synchronously (URL fragment) BEFORE any /me check runs
  if (location.hash && location.hash.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:slug" element={<Destination />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/saved-photos" element={<SavedPhotos />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <AppShell />
          <Toaster position="top-right" theme="dark" richColors />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
