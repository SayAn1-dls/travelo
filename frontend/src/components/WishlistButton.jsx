import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ hotelId, size = "md", className = "" }) {
  const { has, toggle } = useWishlist();
  const active = has(hotelId);
  const sz = size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const iconSz = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  const click = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggle(hotelId);
    if (res?.needsAuth) {
      toast.info("Sign in to save favourites");
      return;
    }
    if (res?.in_wishlist) toast.success("Saved to wishlist");
    else toast("Removed from wishlist");
  };

  return (
    <button
      onClick={click}
      data-testid={`wishlist-btn-${hotelId}`}
      aria-pressed={active}
      className={`${sz} rounded-full backdrop-blur-md border transition-colors flex items-center justify-center ${active ? "bg-[#FF4500]/90 border-[#FF4500]" : "bg-black/50 border-white/15 hover:border-white/40"} ${className}`}
    >
      <Heart className={`${iconSz} ${active ? "fill-black text-black" : "text-white"}`} strokeWidth={2} />
    </button>
  );
}
