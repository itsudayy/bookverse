import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiX, FiPlus, FiUsers } from "react-icons/fi";
import { fetchUsedBooks } from "../services/communityService";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import UsedBookCard from "../components/UsedBookCard";

const categories = [
  "All",
  "Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Self Development",
  "Fantasy",
  "Mystery",
];

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { firebaseUser } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const author = searchParams.get("author") || "";
  const category = searchParams.get("category") || "All";

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setBooks(await fetchUsedBooks({ search, author, category }));
      } catch (err) {
        console.error("Failed to load community books", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, author, category]);

  const hasFilters = search || author || category !== "All";

  return (
    <PageTransition>
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-800 via-indigo-700 to-coral-600 py-20">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="container-app relative text-center">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cream-50/80">
            <FiUsers size={13} /> Shared by readers
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Community Shelf</h1>
          <p className="mx-auto mt-3 max-w-xl text-cream-50/70">
            Pre-loved books shared by Bookverse readers. Borrow one from its owner —
            or contribute your own and earn contribution points.
          </p>
          {firebaseUser && (
            <Link
              to="/my-library"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-cream-50 px-6 py-3 text-sm font-bold text-navy-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <FiPlus /> Contribute a book
            </Link>
          )}
        </div>
      </section>

      <section className="container-app relative z-10 -mt-10 pb-24">
        <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
              <input
                value={search}
                onChange={(e) => updateParam("search", e.target.value)}
                placeholder="Search by title..."
                className="w-full rounded-xl border border-navy-100 bg-cream-50 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-coral-400"
              />
            </div>
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
              <input
                value={author}
                onChange={(e) => updateParam("author", e.target.value)}
                placeholder="Search by author..."
                className="w-full rounded-xl border border-navy-100 bg-cream-50 py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-coral-400"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => updateParam("category", cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                  category === cat
                    ? "bg-indigo-600 text-white shadow-glow"
                    : "bg-cream-100 text-navy-500 hover:bg-navy-100"
                }`}
              >
                {cat}
              </button>
            ))}
            {hasFilters && (
              <button
                onClick={() => setSearchParams({})}
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-coral-600 hover:text-coral-700"
              >
                <FiX /> Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-10">
          <p className="mb-6 text-sm font-semibold text-navy-400">
            {loading
              ? "Searching..."
              : `${books.length} book${books.length !== 1 ? "s" : ""} shared by the community`}
          </p>

          {loading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-navy-100/50" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-navy-200 py-20 text-center"
            >
              <FiUsers className="mx-auto mb-4 text-navy-300" size={34} />
              <p className="font-display text-2xl text-navy-700">
                {hasFilters ? "No books match those filters" : "The community shelf is empty"}
              </p>
              <p className="mt-2 text-sm text-navy-400">
                {hasFilters
                  ? "Try adjusting your search."
                  : "Be the first to share a book you've finished with."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {books.map((book, i) => (
                <UsedBookCard key={book.id} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default Community;
