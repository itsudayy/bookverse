import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiBookOpen, FiCalendar, FiFileText, FiCheckCircle, FiLock, FiAward } from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { purchaseBook } from "../services/pointsService";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";
import RatingStars from "../components/RatingStars";
import ShippingModal from "../components/ShippingModal";
import ReviewSection from "../components/ReviewSection";
import WishlistButton from "../components/WishlistButton";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Points come from context so the navbar badge and this page's buy button
  // always agree, and a purchase here updates the balance everywhere.
  const { firebaseUser, profile, points, refreshPoints } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // One modal serves both actions; `intent` decides which request it fires.
  const [intent, setIntent] = useState(null); // "borrow" | "purchase"
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");

  const fetchBook = async () => {
    try {
      const { data } = await api.get(`/books/${id}`);
      setBook(data);
    } catch (err) {
      console.error("Failed to load book", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openIntent = (which) => {
    if (!firebaseUser) {
      navigate("/login", { state: { from: `/books/${id}` } });
      return;
    }
    setModalError("");
    setMessage(null);
    setIntent(which);
  };

  const handleConfirm = async (shipping) => {
    setSubmitting(true);
    setModalError("");
    try {
      if (intent === "purchase") {
        const res = await purchaseBook(id, shipping);
        setMessage({
          type: "success",
          text: `Purchased! ${res.pointsSpent} points spent — this book is yours permanently.`,
        });
      } else {
        await api.post(`/books/${id}/borrow`, shipping);
        setMessage({ type: "success", text: "Book borrowed! Check My Library." });
      }
      setIntent(null);
      fetchBook();
      refreshPoints();
    } catch (err) {
      setModalError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-navy-200 border-t-coral-500 animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-3xl text-navy-800">Book not found</p>
        <Link to="/collection" className="font-semibold text-coral-600 hover:underline">
          Back to Collection
        </Link>
      </div>
    );
  }

  const ownedByMe = Boolean(book.purchased && profile && book.purchasedBy === profile.firebaseUid);

  return (
    <PageTransition>
      <section className="container-app py-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-navy-400 hover:text-coral-600 transition-colors"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto w-full max-w-sm lg:mx-0"
          >
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-indigo-200 via-coral-100 to-transparent blur-2xl" />
            <div className="overflow-hidden rounded-2xl shadow-2xl">
              <BookCover
                src={book.coverImage}
                alt={book.title}
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
                {book.category}
              </span>
              {book.purchased && (
                <span className="rounded-full bg-navy-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cream-50">
                  {ownedByMe ? "You own this" : "Sold"}
                </span>
              )}
            </div>
            <h1 className="font-display mt-4 text-4xl leading-tight text-navy-900 sm:text-5xl">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-navy-400">by {book.author}</p>

            <div className="mt-4">
              <RatingStars rating={book.rating} size={16} />
            </div>

            <p className="mt-6 max-w-2xl leading-relaxed text-navy-500">
              {book.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: FiCalendar, label: "Published", value: book.publishedYear },
                { icon: FiFileText, label: "Pages", value: book.pages },
                { icon: FiBookOpen, label: "Genre", value: book.category },
                {
                  icon: book.purchased ? FiAward : book.available ? FiCheckCircle : FiLock,
                  label: "Status",
                  value: book.purchased
                    ? ownedByMe
                      ? "Owned"
                      : "Sold"
                    : book.available
                    ? "Available"
                    : "Borrowed",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-navy-100 bg-white p-4 text-center shadow-sm"
                >
                  <stat.icon className="mx-auto mb-2 text-coral-500" size={18} />
                  <p className="text-sm font-bold text-navy-800">{stat.value}</p>
                  <p className="text-[11px] text-navy-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {message && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 rounded-lg px-4 py-3 text-sm font-semibold ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-coral-50 text-coral-700"
                }`}
              >
                {message.text}
              </motion.p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {book.purchased ? (
                <p className="rounded-xl border border-dashed border-navy-200 px-5 py-4 text-sm text-navy-500">
                  {ownedByMe
                    ? "You own this copy permanently — it's yours to keep."
                    : "This copy has been purchased by another reader and has left the library."}
                </p>
              ) : (
                <>
                  {book.available ? (
                    <button
                      onClick={() => openIntent("borrow")}
                      className="rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-8 py-4 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      Borrow Book
                    </button>
                  ) : (
                    <button
                      disabled
                      className="cursor-not-allowed rounded-full bg-navy-200 px-8 py-4 text-sm font-bold text-navy-500"
                    >
                      Currently Borrowed
                    </button>
                  )}

                  {/* The library owns a single copy, so it can't be sold out
                      from under whoever is currently reading it. */}
                  <button
                    onClick={() => openIntent("purchase")}
                    disabled={!book.available}
                    title={
                      book.available
                        ? undefined
                        : "On loan at the moment — it can be bought once it's returned"
                    }
                    className="flex items-center gap-2 rounded-full border-2 border-indigo-600 px-8 py-4 text-sm font-bold text-indigo-600 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-600 hover:text-white disabled:cursor-not-allowed disabled:border-navy-200 disabled:text-navy-400 disabled:hover:translate-y-0 disabled:hover:bg-transparent"
                  >
                    <FiAward />
                    Buy with {points?.pointsToPurchase ?? 200} points
                  </button>
                </>
              )}

              <WishlistButton
                book={{
                  source: "official",
                  bookId: id,
                  title: book.title,
                  author: book.author,
                  coverImage: book.coverImage,
                }}
              />
            </div>

            {!book.purchased && !book.available && (
              <p className="mt-3 text-xs text-navy-400">
                This book is on loan right now. It can be borrowed or bought once it's
                returned.
              </p>
            )}

            {book.purchased ? null : firebaseUser ? (
              <p className="mt-3 text-xs text-navy-400">
                You have{" "}
                <span className="font-bold text-indigo-600">{points?.points ?? 0} points</span>.
                Earn more by sharing your own books on the{" "}
                <Link to="/community" className="font-semibold text-indigo-600 hover:underline">
                  Community Shelf
                </Link>
                .
              </p>
            ) : (
              <p className="mt-3 text-xs text-navy-400">
                You'll need to{" "}
                <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
                  log in
                </Link>{" "}
                to borrow or buy this book.
              </p>
            )}
          </motion.div>
        </div>

        <ReviewSection source="official" bookId={id} />
      </section>

      <ShippingModal
        open={Boolean(intent)}
        title={intent === "purchase" ? "Purchase this book" : "Borrow this book"}
        subtitle={
          intent === "purchase"
            ? `"${book.title}" costs ${points?.pointsToPurchase ?? 200} points. Where should we send it?`
            : `Where should the library parcel "${book.title}"?`
        }
        confirmLabel={intent === "purchase" ? "Confirm purchase" : "Confirm borrow"}
        submitting={submitting}
        error={modalError}
        onClose={() => setIntent(null)}
        onSubmit={handleConfirm}
      />
    </PageTransition>
  );
};

export default BookDetails;
