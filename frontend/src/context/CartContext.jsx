import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import * as cartApi from "../services/cartService";

const CartContext = createContext(null);

const EMPTY = { items: [], subtotal: 0, count: 0 };

export function CartProvider({ children }) {
  const { firebaseUser } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  // The server rebuilds the cart from the catalogue on every call and returns
  // the whole thing, so each mutation just replaces local state — prices and
  // totals can never drift from what checkout will actually charge.
  const load = useCallback(async () => {
    if (!firebaseUser) {
      setCart(EMPTY);
      return;
    }
    setLoading(true);
    try {
      setCart(await cartApi.fetchCart());
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (bookId, quantity = 1) => setCart(await cartApi.addToCart(bookId, quantity));
  const setQuantity = async (bookId, quantity) =>
    setCart(await cartApi.updateCartItem(bookId, quantity));
  const remove = async (bookId) => setCart(await cartApi.removeFromCart(bookId));
  const clear = async () => setCart(await cartApi.clearCart());

  const inCart = (bookId) => cart.items.some((i) => i.bookId === bookId);

  return (
    <CartContext.Provider
      value={{ cart, loading, add, setQuantity, remove, clear, inCart, reload: load }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
