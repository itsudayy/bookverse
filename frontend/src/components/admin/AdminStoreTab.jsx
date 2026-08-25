import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingBag,
  FiGrid,
  FiTag,
  FiStar,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { fetchStoreBooks, fetchStoreCategories } from "../../services/storeService";
import { storeBooksAdmin } from "../../services/adminService";
import BookCover from "../BookCover";
import { taka } from "../../utils/currency";

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

const emptyForm = {
  title: "",
  author: "",
  description: "",
  category: "Fiction",
  price: "",
  rating: 4,
  coverImage: "",
};

const AdminStoreTab = () => {
  const [books, setBooks] = useState([]);
  const [categoryCount, setCategoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [list, cats] = await Promise.all([
        fetchStoreBooks({ sort: "newest" }),
        fetchStoreCategories(),
      ]);
      setBooks(list);
      setCategoryCount(cats.categories.length);
    } catch (err) {
      console.error("Failed to load Store admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description || "",
      category: book.category,
      price: book.price,
      rating: book.rating,
      coverImage: book.coverImage,
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        rating: Number(form.rating),
      };
      if (editingId) {
        await storeBooksAdmin.update(editingId, payload);
      } else {
        await storeBooksAdmin.create(payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save this Store book.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await storeBooksAdmin.remove(id);
      fetchAll();
    } catch (err) {
      console.error("Failed to delete Store book", err);
    } finally {
      setDeletingId(null);
    }
  };

  const avgPrice = books.length
    ? Math.round(books.reduce((s, b) => s + (b.price || 0), 0) / books.length)
    : 0;
  const avgRating = books.length
    ? (books.reduce((s, b) => s + (b.rating || 0), 0) / books.length).toFixed(1)
    : "—";

  const statCards = [
    { label: "Store Books", value: books.length, icon: FiShoppingBag, color: "text-indigo-600 bg-indigo-50" },
    { label: "Categories", value: categoryCount, icon: FiGrid, color: "text-navy-600 bg-navy-100" },
    { label: "Average Price", value: taka(avgPrice), icon: FiTag, color: "text-coral-600 bg-coral-50" },
    { label: "Average Rating", value: avgRating, icon: FiStar, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-navy-900">Store Catalogue</h2>
          <p className="mt-1 text-sm text-navy-400">
            New copies sold for real money via Stripe — separate stock from the
            library's lending Collection.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-5 py-3 text-sm font-bold text-white shadow-coral hover:-translate-y-0.5 transition-transform"
        >
          <FiPlus /> Add Store Book
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon size={17} />
            </span>
            <p className="mt-3 font-display text-2xl text-navy-900">{s.value}</p>
            <p className="text-xs text-navy-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cream-100 text-xs font-bold uppercase tracking-wide text-navy-400">
              <tr>
                <th className="px-5 py-4">Book</th>
                <th className="px-5 py-4">Author</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Rating</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-navy-400">
                    Loading Store books...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-navy-400">
                    The Store is empty. Add the first book.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr key={book.id} className="hover:bg-cream-50/70 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <BookCover
                          src={book.coverImage}
                          alt={book.title}
                          className="h-12 w-9 rounded object-cover"
                        />
                        <span className="font-semibold text-navy-800 line-clamp-1 max-w-[220px]">
                          {book.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-navy-500">{book.author}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-navy-800">{taka(book.price)}</td>
                    <td className="px-5 py-3 text-navy-500">{Number(book.rating).toFixed(1)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(book)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          disabled={deletingId === book.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-600 hover:bg-coral-100 hover:text-coral-600 transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-950/60 backdrop-blur-sm p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl text-navy-900">
                  {editingId ? "Edit Store Book" : "Add Store Book"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-navy-400 hover:bg-cream-100"
                >
                  <FiX />
                </button>
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                    Title
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
                      Author
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
                    Description
                  </label>
                  <textarea
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                      Price (৳)
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="e.g. 450"
                      className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                      Rating
                    </label>
                    <input
                      required
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      name="rating"
                      value={form.rating}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                    Cover Image URL
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

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3 text-sm font-bold text-white shadow-coral hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add to Store"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminStoreTab;
