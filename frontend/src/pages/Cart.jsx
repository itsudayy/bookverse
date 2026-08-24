import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiArrowRight, FiTrash2, FiMinus, FiPlus, FiLock } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { startCheckout } from "../services/cartService";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";
import { taka } from "../utils/currency";

const Cart = () => {
  const { cart, loading, setQuantity, remove, clear } = useCart();
  const [searchParams] = useSearchParams();
  const [busyId, setBusyId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");

  const canceled = searchParams.get("canceled") === "1";

  const changeQty = async (bookId, qty) => {
    setBusyId(bookId);
    try {
      await setQuantity(bookId, qty);
    } catch (err) {
      console.error("Failed to update quantity", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError("");
    try {
      const { url } = await startCheckout();
      // Stripe hosts the payment page, so we hand the browser over to it.
      window.location.href = url;
    } catch (err) {
      setError(err.response?.data?.message || "Could not start checkout. Please try again.");
      setCheckingOut(false);
    }
  };

  return (
    <PageTransition>
      <section className="bg-navy-950 py-16">
        <div className="container-app">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            Your cart
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Shopping Cart</h1>
          {cart.count > 0 && (
            <p className="mt-3 text-cream-100/60">
              {cart.count} item{cart.count !== 1 ? "s" : ""} ready to check out.
            </p>
          )}
        </div>
      </section>

      <section className="container-app py-14">
        {canceled && (
          <p className="mb-6 rounded-xl bg-cream-100 px-5 py-3 text-sm font-semibold text-navy-600">
            Payment was cancelled — your cart is still here whenever you're ready.
          </p>
        )}
        {error && (
          <p className="mb-6 rounded-xl bg-coral-50 px-5 py-3 text-sm font-semibold text-coral-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-navy-100/50" />
            ))}
          </div>
        ) : cart.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-200 py-20 text-center">
            <FiShoppingCart className="mx-auto mb-4 text-navy-300" size={38} />
            <p className="font-display text-2xl text-navy-700">Your cart is empty</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-navy-400">
              Browse the Store and add a few books you'd like to own.
            </p>
            <Link
              to="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-coral transition-transform hover:-translate-y-0.5"
            >
              Go to the Store <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <AnimatePresence>
                {cart.items.map((item) => (
                  <motion.div
                    key={item.bookId}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    className="flex flex-wrap gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm sm:flex-nowrap"
                  >
                    <Link to={`/store/${item.bookId}`} className="shrink-0">
                      <BookCover
                        src={item.coverImage}
                        alt={item.title}
                        className="h-32 w-24 rounded-lg object-cover"
                      />
                    </Link>

                    <div className="flex min-w-[180px] flex-1 flex-col">
                      <Link
                        to={`/store/${item.bookId}`}
                        className="font-display text-lg leading-snug text-navy-900 hover:text-coral-600"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-0.5 text-xs text-navy-400">{item.author}</p>
                      <span className="mt-1 w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600">
                        {item.category}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-navy-500">
                        {taka(item.price)} each
                      </p>

                      <div className="mt-auto flex items-center gap-3 pt-3">
                        <div className="flex items-center rounded-full border border-navy-200">
                          <button
                            onClick={() => changeQty(item.bookId, item.quantity - 1)}
                            disabled={busyId === item.bookId || item.quantity <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-navy-500 transition-colors hover:bg-cream-100 disabled:opacity-40"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-navy-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => changeQty(item.bookId, item.quantity + 1)}
                            disabled={busyId === item.bookId}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-navy-500 transition-colors hover:bg-cream-100 disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <FiPlus size={13} />
                          </button>
                        </div>

                        <button
                          onClick={() => remove(item.bookId)}
                          className="flex items-center gap-1.5 text-xs font-bold text-coral-600 hover:text-coral-700"
                        >
                          <FiTrash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>

                    <p className="font-display self-start text-xl text-navy-900">
                      {taka(item.lineTotal)}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={clear}
                className="text-xs font-bold text-navy-400 hover:text-coral-600"
              >
                Clear cart
              </button>
            </div>

            {/* Order summary */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-navy-100 bg-white p-6 shadow-card">
                <h2 className="font-display text-2xl text-navy-900">Order Summary</h2>

                <div className="mt-5 space-y-2.5 text-sm">
                  <div className="flex justify-between text-navy-500">
                    <span>Items ({cart.count})</span>
                    <span className="font-semibold text-navy-700">{taka(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-navy-500">
                    <span>Delivery</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-navy-100 pt-5">
                  <span className="font-bold text-navy-800">Total</span>
                  <span className="font-display text-3xl text-navy-900">{taka(cart.subtotal)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-4 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {checkingOut ? "Redirecting..." : "Proceed to Checkout"}
                  {!checkingOut && <FiArrowRight />}
                </button>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-navy-400">
                  <FiLock size={11} /> Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </PageTransition>
  );
};

export default Cart;
