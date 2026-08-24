import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import api from "../services/api";
import PageTransition from "../components/PageTransition";
import BookCard from "../components/BookCard";

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

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "Title A-Z" },
  { value: "rating", label: "Highest Rated" },
];

const Collection = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const author = searchParams.get("author") || "";
  const category = searchParams.get("category") || "All";
  const sort = searchParams.get("sort") || "newest";

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/books", {
          params: { search, author, category, sort },
        });
        setBooks(data);
      } catch (err) {
        console.error("Failed to load books", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [search, author, category, sort]);

  const hasFilters = search || author || category !== "All";

  return (
    <PageTransition>
      <section className="relative overflow-hidden bg-navy-950 py-20">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="container-app relative text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            The Full Shelf
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">
            Browse the Collection
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-cream-100/60">
            Search, filter, and sort through every title in Bookverse to find exactly
            what you're looking for.
          </p>
        </div>
      </section>

      <section className="container-app -mt-10 relative z-10 pb-24">
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
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-navy-100 pt-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-navy-400">
                Sort by
              </span>
              <select
                value={sort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="rounded-lg border border-navy-100 bg-cream-50 px-3 py-2 text-sm font-semibold text-navy-700 outline-none focus:border-coral-400"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <button
                onClick={() => setSearchParams({})}
                className="flex items-center gap-1.5 text-xs font-bold text-coral-600 hover:text-coral-700"
              >
                <FiX /> Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-10">
          <p className="mb-6 text-sm font-semibold text-navy-400">
            {loading ? "Searching..." : `${books.length} book${books.length !== 1 ? "s" : ""} found`}
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
              <p className="font-display text-2xl text-navy-700">No books found</p>
              <p className="mt-2 text-sm text-navy-400">
                Try adjusting your search or filters.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {books.map((book, i) => (
                <BookCard key={book._id} book={book} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default Collection;
