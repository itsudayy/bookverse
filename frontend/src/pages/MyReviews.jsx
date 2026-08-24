import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar, FiArrowRight } from "react-icons/fi";
import { fetchMyReviews } from "../services/reviewService";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";
import RatingStars from "../components/RatingStars";

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setReviews(await fetchMyReviews());
      } catch (err) {
        console.error("Failed to load your reviews", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const linkFor = (r) => (r.source === "community" ? `/community/${r.bookId}` : `/books/${r.bookId}`);

  return (
    <PageTransition>
      <section className="bg-navy-950 py-16">
        <div className="container-app">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            Your account
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Rating &amp; Reviews</h1>
          <p className="mt-3 max-w-xl text-cream-100/60">
            Every review you've shared across the official Collection and the community
            shelf.
          </p>
        </div>
      </section>

      <section className="container-app py-16">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-navy-100/50" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-200 py-20 text-center">
            <FiStar className="mx-auto mb-4 text-navy-300" size={36} />
            <p className="font-display text-2xl text-navy-700">You haven't reviewed anything yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-navy-400">
              Open any book and share what you thought — your reviews will collect here.
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
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
            <div className="space-y-4">
              {reviews.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm sm:p-5"
                >
                  {/* A book bought with points is deleted, so its page is gone;
                      the review still stands on its snapshot, just unlinked. */}
                  {r.bookExists ? (
                    <Link to={linkFor(r)} className="shrink-0">
                      <BookCover
                        src={r.bookCover}
                        alt={r.bookTitle}
                        className="h-28 w-20 rounded-lg object-cover"
                      />
                    </Link>
                  ) : (
                    <BookCover
                      src={r.bookCover}
                      alt={r.bookTitle}
                      className="h-28 w-20 shrink-0 rounded-lg object-cover grayscale-[30%]"
                    />
                  )}
                  <div className="flex flex-1 flex-col">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        {r.bookExists ? (
                          <Link
                            to={linkFor(r)}
                            className="font-display text-lg leading-snug text-navy-900 hover:text-coral-600"
                          >
                            {r.bookTitle}
                          </Link>
                        ) : (
                          <p className="font-display text-lg leading-snug text-navy-900">
                            {r.bookTitle}
                          </p>
                        )}
                        {r.bookAuthor && (
                          <p className="mt-0.5 text-xs text-navy-400">{r.bookAuthor}</p>
                        )}
                        {!r.bookExists && (
                          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-navy-300">
                            No longer in the library
                          </p>
                        )}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          r.source === "community"
                            ? "bg-coral-50 text-coral-600"
                            : "bg-indigo-50 text-indigo-600"
                        }`}
                      >
                        {r.source === "community" ? "Community" : "Official"}
                      </span>
                    </div>

                    <div className="mt-2">
                      <RatingStars rating={r.rating} size={13} />
                    </div>

                    {r.text && (
                      <p className="mt-2 text-sm leading-relaxed text-navy-500">{r.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </section>
    </PageTransition>
  );
};

export default MyReviews;
