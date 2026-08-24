import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiStar } from "react-icons/fi";
import { fetchReviews, addReview } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";
import RatingStars from "./RatingStars";

// Works for both shelves — `source` is "official" (a Mongo book) or "community"
// (a Firestore used book). Reviews themselves always live in Firestore.
const ReviewSection = ({ source, bookId }) => {
  const { firebaseUser } = useAuth();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      setData(await fetchReviews(source, bookId));
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, bookId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!rating) return setError("Please pick a star rating.");
    setSubmitting(true);
    try {
      await addReview(source, bookId, { rating, text });
      setRating(0);
      setText("");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not post your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 border-t border-navy-100 pt-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-navy-900">Reader Reviews</h2>
          <p className="mt-1 text-sm text-navy-400">
            {data.count === 0
              ? "No reviews yet — be the first."
              : `${data.count} review${data.count !== 1 ? "s" : ""}`}
          </p>
        </div>
        {data.count > 0 && (
          <div className="text-right">
            <p className="font-display text-3xl text-navy-900">{data.average.toFixed(1)}</p>
            <RatingStars rating={data.average} size={13} showValue={false} />
          </div>
        )}
      </div>

      {firebaseUser ? (
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"
        >
          <p className="mb-3 text-sm font-bold text-navy-800">Share your thoughts</p>

          {error && (
            <p className="mb-3 rounded-lg bg-coral-50 px-4 py-2.5 text-sm font-semibold text-coral-700">
              {error}
            </p>
          )}

          <div className="mb-4 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className="transition-transform duration-200 hover:scale-110"
              >
                <FiStar
                  size={24}
                  className={
                    n <= (hovered || rating)
                      ? "fill-coral-400 text-coral-400"
                      : "text-navy-200"
                  }
                />
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What did you think of this book? (optional)"
            className="w-full rounded-xl border border-navy-100 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-coral-400"
          />

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-6 py-2.5 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? "Posting..." : "Post review"}
          </button>
        </form>
      ) : (
        <p className="mb-10 rounded-2xl border border-dashed border-navy-200 px-6 py-5 text-sm text-navy-400">
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
            Log in
          </Link>{" "}
          to leave a review.
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-navy-100/50" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data.reviews.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-2xl border border-navy-100 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-coral-500 text-xs font-bold uppercase text-white">
                    {r.userName?.[0] || "?"}
                  </span>
                  <p className="text-sm font-bold text-navy-800">{r.userName}</p>
                </div>
                <RatingStars rating={r.rating} size={12} showValue={false} />
              </div>
              {r.text && (
                <p className="mt-3 text-sm leading-relaxed text-navy-500">{r.text}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewSection;
