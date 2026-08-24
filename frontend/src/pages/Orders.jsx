import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPackage, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { fetchOrders } from "../services/cartService";
import PageTransition from "../components/PageTransition";
import { taka } from "../utils/currency";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch((err) => console.error("Failed to load orders", err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (ts) => {
    const ms = ts?._seconds ? ts._seconds * 1000 : ts?.seconds ? ts.seconds * 1000 : null;
    return ms ? new Date(ms).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";
  };

  return (
    <PageTransition>
      <section className="bg-navy-950 py-16">
        <div className="container-app">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            Your account
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Orders &amp; Tracking</h1>
          <p className="mt-3 max-w-xl text-cream-100/60">
            Everything you've bought from the Bookverse Store.
          </p>
        </div>
      </section>

      <section className="container-app py-16">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-navy-100/50" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-200 py-20 text-center">
            <FiPackage className="mx-auto mb-4 text-navy-300" size={38} />
            <p className="font-display text-2xl text-navy-700">No orders yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-navy-400">
              Books you buy from the Store will show up here with their receipts.
            </p>
            <Link
              to="/store"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-coral transition-transform hover:-translate-y-0.5"
            >
              Go to the Store <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((o, i) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 bg-cream-50/60 px-6 py-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-navy-400">
                      Order
                    </p>
                    <p className="font-mono text-sm font-semibold text-navy-800">
                      #{o.id.slice(0, 10).toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-navy-400">
                      Placed
                    </p>
                    <p className="text-sm font-semibold text-navy-800">{formatDate(o.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-navy-400">
                      Total
                    </p>
                    <p className="font-display text-lg text-navy-900">{taka(o.total)}</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                    <FiCheckCircle size={12} /> {o.status || "paid"}
                  </span>
                </div>

                <div className="divide-y divide-navy-100/70 px-6">
                  {(o.items || []).map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 text-sm">
                      <span className="text-navy-700">
                        {it.title} <span className="text-navy-400">× {it.quantity}</span>
                      </span>
                      <span className="font-semibold text-navy-800">{taka(it.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </PageTransition>
  );
};

export default Orders;
