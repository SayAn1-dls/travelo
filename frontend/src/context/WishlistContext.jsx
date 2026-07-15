import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) { setIds([]); return; }
    try {
      const { data } = await api.get("/wishlist");
      setIds(data.hotel_ids || []);
    } catch { /* ignore */ }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (hotel_id) => {
    if (!user) return { in_wishlist: false, needsAuth: true };
    const { data } = await api.post("/wishlist/toggle", { hotel_id });
    setIds((prev) => (data.in_wishlist ? [...new Set([hotel_id, ...prev])] : prev.filter((x) => x !== hotel_id)));
    return data;
  }, [user]);

  const has = useCallback((hotel_id) => ids.includes(hotel_id), [ids]);

  return (
    <WishlistContext.Provider value={{ ids, toggle, has, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
