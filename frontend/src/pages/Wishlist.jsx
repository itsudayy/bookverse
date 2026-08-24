import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHeart, FiArrowUpRight, FiX, FiArrowRight } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";

const Wishlist = () => {
  const { items, loading, toggle } = useWishlist();

  const linkFor = (i) => (i.source === "community" ? `/community/${i.bookId}` : `/books/${i.bookId}`);

  return (
    <PageTransition>
      <section className="bg-navy-950 py-16">
        <div className="container-app">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            Your account
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Wishlist</h1>
          <p className="mt-3 max-w-xl text-cream-100/60">
            Books you've saved to read next — from both the official Collection and the
            community shelf.
          </p>
        </div>
      </section>

      <section className="container-app py-16">
        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-navy-100/50" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-200 py-20 text-center">
            <FiHeart className="mx-auto mb-4 text-navy-300" size={36} />
            <p className="font-display text-2xl text-navy-700">Your wishlist is empty</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-navy-400">
              Tap the heart on any book to save it here for later.
            </p>
            <Link
              to="/collection"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-coral transition-transform hover:-translate-y-0.5"
            >
              Browse the Collection <FiArrowRight />
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm font-semibold text-navy-400">
              {items.length} saved book{items.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={`${item.source}-${item.bookId}`}
                    layout
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: (i % 8) * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100/60 bg-white shadow-sm transition-shadow duration-500 hover:shadow-card"
                  >
                    <Link
                      to={linkFor(item)}
                      className="relative block aspect-[3/4] overflow-hidden bg-navy-800"
                    >
                      <BookCover
                        src={item.coverImage}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <span
                        className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-md ${
                          item.source === "community"
                            ? "bg-coral-500/90 text-white"
                            : "bg-indigo-600/90 text-white"
                        }`}
                      >
                        {item.source === "community" ? "Community" : "Official"}
                      </span>
                    </Link>

                    <button
                      onClick={() => toggle(item)}
                      aria-label="Remove from wishlist"
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy-500 shadow-sm backdrop-blur-md transition-colors duration-300 hover:bg-white hover:text-coral-600"
                    >
                      <FiX size={15} />
                    </button>

                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="font-display text-lg leading-snug text-navy-900 line-clamp-2">
                        {item.title}
                      </h3>
                      {item.author && <p className="mt-1 text-sm text-navy-400">{item.author}</p>}
                      <Link
                        to={linkFor(item)}
                        className="mt-auto flex items-center gap-1 pt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        View Book <FiArrowUpRight size={13} />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </section>
    </PageTransition>
  );
};

export default Wishlist;
