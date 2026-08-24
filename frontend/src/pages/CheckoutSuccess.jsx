import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle, FiArrowRight, FiPackage } from "react-icons/fi";
import { confirmCheckout } from "../services/cartService";
import { useCart } from "../context/CartContext";
import PageTransition from "../components/PageTransition";
import { taka } from "../utils/currency";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { reload } = useCart();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const ran = useRef(false);

  useEffect(() => {
    // StrictMode mounts twice in dev; the confirm endpoint is idempotent but
    // there's no reason to call it twice.
    if (ran.current || !sessionId) return;
    ran.current = true;

    confirmCheckout(sessionId)
      .then((o) => {
        setOrder(o);
        reload(); // the server emptied the cart — mirror that locally
      })
      .catch((err) =>
        setError(err.response?.data?.message || "We couldn't confirm this payment.")
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <PageTransition>
      <section className="container-app flex min-h-[70vh] items-center justify-center py-20">
        <div className="w-full max-w-lg text-center">
          {loading ? (
            <>
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-navy-200 border-t-coral-500" />
              <p className="mt-6 text-sm text-navy-400">Confirming your payment...</p>
            </>
          ) : error ? (
            <>
              <p className="font-display text-3xl text-navy-900">Something went wrong</p>
              <p className="mt-3 text-sm text-navy-500">{error}</p>
              <Link
                to="/cart"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-coral"
              >
                Back to cart
              </Link>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"
              >
                <FiCheckCircle size={40} />
              </motion.span>

              <h1 className="font-display mt-6 text-4xl text-navy-900">Thank you!</h1>
              <p className="mt-2 text-navy-500">
                Your order is confirmed and on its way.
              </p>

              <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 text-left shadow-card">
                <div className="flex items-center justify-between border-b border-navy-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wide text-navy-400">
                    Order total
                  </span>
                  <span className="font-display text-2xl text-navy-900">{taka(order?.total)}</span>
                </div>
                <div className="mt-4 space-y-2">
                  {(order?.items || []).map((i, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-navy-600">
                        {i.title} <span className="text-navy-400">× {i.quantity}</span>
                      </span>
                      <span className="font-semibold text-navy-700">{taka(i.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  to="/orders"
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-6 py-3 text-sm font-bold text-white shadow-coral transition-transform hover:-translate-y-0.5"
                >
                  <FiPackage /> View my orders
                </Link>
                <Link
                  to="/store"
                  className="flex items-center gap-2 rounded-full border-2 border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 transition-colors hover:border-coral-400 hover:text-coral-600"
                >
                  Keep shopping <FiArrowRight />
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default CheckoutSuccess;
