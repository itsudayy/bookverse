import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiUser, FiCreditCard, FiMapPin } from "react-icons/fi";

// The library parcels books to people's homes, so borrowing and purchasing both
// need the same delivery details. One component serves both so the two flows
// can never drift apart.
const ShippingModal = ({ open, title, subtitle, confirmLabel, submitting, error, onClose, onSubmit }) => {
  const [form, setForm] = useState({ shippingName: "", shippingIdNumber: "", shippingAddress: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
          >
            <div className="mb-1 flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl text-navy-900">{title}</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy-400 hover:bg-cream-100"
              >
                <FiX />
              </button>
            </div>
            <p className="mb-6 text-sm text-navy-400">{subtitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="rounded-lg bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700">
                  {error}
                </p>
              )}

              <div className="relative">
                <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
                <input
                  required
                  name="shippingName"
                  value={form.shippingName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-navy-100 bg-cream-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-coral-400"
                />
              </div>

              <div className="relative">
                <FiCreditCard className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
                <input
                  required
                  name="shippingIdNumber"
                  value={form.shippingIdNumber}
                  onChange={handleChange}
                  placeholder="ID number"
                  className="w-full rounded-xl border border-navy-100 bg-cream-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-coral-400"
                />
              </div>

              <div className="relative">
                <FiMapPin className="pointer-events-none absolute left-4 top-4 text-navy-300" />
                <textarea
                  required
                  rows={3}
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={handleChange}
                  placeholder="Home address"
                  className="w-full rounded-xl border border-navy-100 bg-cream-50 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-coral-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3.5 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? "Please wait..." : confirmLabel}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShippingModal;
