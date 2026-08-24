import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchWishlist,
  addToWishlist as apiAdd,
  removeFromWishlist as apiRemove,
} from "../services/wishlistService";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!firebaseUser) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      setItems(await fetchWishlist());
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    load();
  }, [load]);

  const isWishlisted = (source, bookId) =>
    items.some((i) => i.source === source && i.bookId === bookId);

  // Optimistic toggle so the heart responds instantly; reconciled on failure.
  const toggle = async (book) => {
    const key = (i) => i.source === book.source && i.bookId === book.bookId;
    const already = items.some(key);
    if (already) {
      setItems((prev) => prev.filter((i) => !key(i)));
      try {
        await apiRemove(book.source, book.bookId);
      } catch (err) {
        console.error("Failed to remove from wishlist", err);
        load();
      }
    } else {
      const optimistic = { ...book, id: `temp-${Date.now()}` };
      setItems((prev) => [optimistic, ...prev]);
      try {
        const saved = await apiAdd(book);
        setItems((prev) => prev.map((i) => (i.id === optimistic.id ? saved : i)));
      } catch (err) {
        console.error("Failed to add to wishlist", err);
        load();
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ items, loading, isWishlisted, toggle, reload: load }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
