import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import api from "../api/axios";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";

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
  publishedYear: new Date().getFullYear(),
  pages: "",
  coverImage: "",
  rating: 4,
  available: true,
};

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
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
      const [statsRes, booksRes] = await Promise.all([
        api.get("/stats"),
        api.get("/books", { params: { sort: "newest" } }),
      ]);
      setStats(statsRes.data);
      setBooks(booksRes.data);
    } catch (err) {
      console.error("Failed to load admin data", err);
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
    setEditingId(book._id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      publishedYear: book.publishedYear,
      pages: book.pages,
      coverImage: book.coverImage,
      rating: book.rating,
      available: book.available,
    });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        publishedYear: Number(form.publishedYear),
        pages: Number(form.pages),
        rating: Number(form.rating),
      };
      if (editingId) {
        await api.put(`/books/${editingId}`, payload);
      } else {
        await api.post("/books", payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save book.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/books/${id}`);
      fetchAll();
    } catch (err) {
      console.error("Failed to delete book", err);
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    { label: "Total Books", value: stats?.totalBooks ?? "—", icon: FiBookOpen, color: "text-indigo-600 bg-indigo-50" },
    { label: "Available Books", value: stats?.availableBooks ?? "—", icon: FiCheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { label: "Borrowed Books", value: stats?.borrowedBooks ?? "—", icon: FiClock, color: "text-coral-600 bg-coral-50" },
    { label: "Categories", value: stats?.categories ?? "—", icon: FiGrid, color: "text-navy-600 bg-navy-100" },
  ];

  return (
    <PageTransition>
      <section className="bg-navy-950 py-14">
        <div className="container-app flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
              Demo Interface
            </p>
            <h1 className="font-display text-3xl text-cream-50 sm:text-4xl">Admin Dashboard</h1>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-5 py-3 text-sm font-bold text-white shadow-coral hover:-translate-y-0.5 transition-transform"
          >
            <FiPlus /> Add Book
          </button>
        </div>
      </section>

      <section className="container-app -mt-8 relative z-10 pb-24">
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

        <div className="mt-10 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-cream-100 text-xs font-bold uppercase tracking-wide text-navy-400">
                <tr>
                  <th className="px-5 py-4">Book</th>
                  <th className="px-5 py-4">Author</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Year</th>
                  <th className="px-5 py-4">Availability</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-navy-400">
                      Loading books...
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book._id} className="hover:bg-cream-50/70 transition-colors">
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
                      <td className="px-5 py-3 text-navy-500">{book.publishedYear}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            book.available
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-navy-100 text-navy-500"
                          }`}
                        >
                          {book.available ? "Available" : "Borrowed"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(book)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-600 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(book._id)}
                            disabled={deletingId === book._id}
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
      </section>

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
                  {editingId ? "Edit Book" : "Add New Book"}
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
                    required
                    rows={3}
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                      Year
                    </label>
                    <input
                      required
                      type="number"
                      name="publishedYear"
                      value={form.publishedYear}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-coral-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-navy-400">
                      Pages
                    </label>
                    <input
                      required
                      type="number"
                      name="pages"
                      value={form.pages}
                      onChange={handleChange}
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

                <label className="flex items-center gap-2 text-sm font-semibold text-navy-600">
                  <input
                    type="checkbox"
                    name="available"
                    checked={form.available}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-navy-200 text-coral-500 focus:ring-coral-400"
                  />
                  Available for borrowing
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3 text-sm font-bold text-white shadow-coral hover:-translate-y-0.5 transition-transform disabled:opacity-60"
                >
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Add Book"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Admin;
