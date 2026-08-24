import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiX, FiStar, FiSliders, FiShoppingBag } from "react-icons/fi";
import { fetchStoreBooks, fetchStoreCategories } from "../services/storeService";
import PageTransition from "../components/PageTransition";
import StoreBookCard from "../components/StoreBookCard";

const SORTS = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const RATINGS = [5, 4, 3, 2];

const Store = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const minRating = searchParams.get("minRating") || "";
  const sort = searchParams.get("sort") || "price-asc";

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  useEffect(() => {
    fetchStoreCategories()
      .then((d) => {
        setCategories(d.categories);
        setTotal(d.total);
      })
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        setBooks(await fetchStoreBooks({ search, category, minRating, sort }));
      } catch (err) {
        console.error("Failed to load store books", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, category, minRating, sort]);

  const hasFilters = search || category !== "All" || minRating;

  const Sidebar = (
    <div className="space-y-8">
      {/* Sort by price — the two options a bookshop actually needs */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-navy-400">
          Sort by price
        </h3>
        <div className="space-y-1.5">
          {SORTS.map((s) => (
            <button
              key={s.value}
              onClick={() => updateParam("sort", s.value)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${
                sort === s.value
                  ? "bg-coral-50 text-coral-700"
                  : "text-navy-600 hover:bg-cream-100"
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                  sort === s.value ? "border-coral-500" : "border-navy-200"
                }`}
              >
                {sort === s.value && <span className="h-2 w-2 rounded-full bg-coral-500" />}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shop by category */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-navy-400">
          Shop by category
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => updateParam("category", "All")}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${
              category === "All" ? "bg-indigo-50 text-indigo-700" : "text-navy-600 hover:bg-cream-100"
            }`}
          >
            All Books <span className="text-xs text-navy-400">{total}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => updateParam("category", c.name)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${
                category === c.name
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-navy-600 hover:bg-cream-100"
              }`}
            >
              {c.name} <span className="text-xs text-navy-400">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Customer rating */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-navy-400">
          Customer rating
        </h3>
        <div className="space-y-1">
          {RATINGS.map((r) => (
            <button
              key={r}
              onClick={() => updateParam("minRating", String(minRating) === String(r) ? "" : r)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors duration-200 ${
                String(minRating) === String(r)
                  ? "bg-coral-50 text-coral-700"
                  : "text-navy-600 hover:bg-cream-100"
              }`}
            >
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    size={13}
                    className={i < r ? "fill-coral-400 text-coral-400" : "text-navy-200"}
                  />
                ))}
              </span>
              <span className="text-xs">&amp; up</span>
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={() => setSearchParams({ sort })}
          className="flex items-center gap-1.5 text-xs font-bold text-coral-600 hover:text-coral-700"
        >
          <FiX /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <PageTransition>
      <section className="relative overflow-hidden bg-navy-950 py-20">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="container-app relative text-center">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            <FiShoppingBag size={13} /> Bookverse Store
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Buy Your Next Read</h1>
          <p className="mx-auto mt-3 max-w-xl text-cream-100/60">
            Brand-new copies delivered to your door. Browse, add to cart and pay securely.
          </p>

          <div className="relative mx-auto mt-8 max-w-lg">
            <FiSearch className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-navy-300" />
            <input
              value={search}
              onChange={(e) => updateParam("search", e.target.value)}
              placeholder="Search by title or author..."
              className="w-full rounded-full border border-cream-100/20 bg-cream-50/10 py-3.5 pl-12 pr-4 text-sm text-cream-50 placeholder:text-cream-200/40 outline-none backdrop-blur-sm focus:border-coral-400"
            />
          </div>
        </div>
      </section>

      <section className="container-app py-12">
        <button
          onClick={() => setFiltersOpen((s) => !s)}
          className="mb-6 flex items-center gap-2 rounded-full border border-navy-200 px-5 py-2.5 text-sm font-bold text-navy-700 lg:hidden"
        >
          <FiSliders size={15} /> Filters
        </button>

        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Filters live on the left on desktop, collapsible on mobile */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
              {Sidebar}
            </div>
          </aside>

          <AnimatePresence>
            {filtersOpen && (
              <motion.aside
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden lg:hidden"
              >
                <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
                  {Sidebar}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          <div>
            <p className="mb-6 text-sm font-semibold text-navy-400">
              {loading ? "Loading..." : `${books.length} book${books.length !== 1 ? "s" : ""}`}
              {category !== "All" && ` in ${category}`}
            </p>

            {loading ? (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-navy-100/50" />
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy-200 py-20 text-center">
                <FiShoppingBag className="mx-auto mb-4 text-navy-300" size={34} />
                <p className="font-display text-2xl text-navy-700">No books match those filters</p>
                <p className="mt-2 text-sm text-navy-400">Try widening your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
                {books.map((b, i) => (
                  <StoreBookCard key={b.id} book={b} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Store;
