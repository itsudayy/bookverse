import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

const categories = [
  "Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Self Development",
  "Fantasy",
  "Mystery",
];

const conditions = ["Like New", "Good", "Fair", "Well Read"];

const empty = {
  title: "",
  author: "",
  description: "",
  category: "Fiction",
  condition: "Good",
  coverImage: "",
};

const AddUsedBookModal = ({ open, pointsPerContribution, submitting, error, onClose, onSubmit }) => {
  const [form, setForm] = useState(empty);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, () => setForm(empty));
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
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
          >
            <div className="mb-1 flex items-start justify-between gap-4">
              <h2 className="font-display text-2xl text-navy-900">Share a used book</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy-400 hover:bg-cream-100"
              >
                <FiX />
              </button>
            </div>
            <p className="mb-6 text-sm text-navy-400">
              Add a book you've finished with — you'll earn{" "}
              <span className="font-bold text-indigo-600">
                {pointsPerContribution} contribution points
              </span>
              , and other readers can ask to borrow it.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <p className="rounded-lg bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700">
                  {error}
                </p>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                  Book name
                </label>
                <input
                  required
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                    Writer
                  </label>
                  <input
                    required
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                  Image URL
                </label>
                <input
                  required
                  name="coverImage"
                  value={form.coverImage}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                  Condition
                </label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                >
                  {conditions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                  Description
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Anything other readers should know about this copy."
                  className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3 text-sm font-bold text-white shadow-coral transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? "Sharing..." : "Share book"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddUsedBookModal;
