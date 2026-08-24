import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiBookOpen, FiUser, FiCheckCircle, FiLock, FiPackage } from "react-icons/fi";
import { fetchUsedBook, requestBorrow } from "../services/communityService";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";
import ShippingModal from "../components/ShippingModal";
import ReviewSection from "../components/ReviewSection";
import WishlistButton from "../components/WishlistButton";

const CommunityBookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser, profile } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  const load = async () => {
    try {
      setBook(await fetchUsedBook(id));
    } catch (err) {
      console.error("Failed to load book", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = book && profile && book.ownerUid === profile.firebaseUid;

  const openRequest = () => {
    if (!firebaseUser) {
      navigate("/login", { state: { from: `/community/${id}` } });
      return;
    }
    setError("");
    setModalOpen(true);
  };

  const handleRequest = async (shipping) => {
    setSubmitting(true);
    setError("");
    try {
      await requestBorrow(id, shipping);
      setModalOpen(false);
      setMessage({
        type: "success",
        text: "Request sent — the owner has been notified.",
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send the request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-navy-200 border-t-coral-500" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <p className="font-display text-3xl text-navy-800">Book not found</p>
        <Link to="/community" className="font-semibold text-coral-600 hover:underline">
          Back to Community Shelf
        </Link>
      </div>
    );
  }

  return (
    <PageTransition>
      <section className="container-app py-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-navy-400 transition-colors hover:text-coral-600"
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
              <span className="rounded-full bg-coral-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-coral-700">
                Community book
              </span>
            </div>

            <h1 className="font-display mt-4 text-4xl leading-tight text-navy-900 sm:text-5xl">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-navy-400">by {book.author}</p>

            {book.description && (
              <p className="mt-6 max-w-2xl leading-relaxed text-navy-500">{book.description}</p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { icon: FiUser, label: "Shared by", value: book.ownerName },
                { icon: FiBookOpen, label: "Condition", value: book.condition },
                {
                  icon: book.available ? FiCheckCircle : FiLock,
                  label: "Status",
                  value: book.available ? "Available" : "On loan",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-navy-100 bg-white p-4 text-center shadow-sm"
                >
                  <s.icon className="mx-auto mb-2 text-coral-500" size={18} />
                  <p className="text-sm font-bold text-navy-800">{s.value}</p>
                  <p className="text-[11px] text-navy-400">{s.label}</p>
                </div>
              ))}
            </div>

            {message && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
              >
                {message.text}
              </motion.p>
            )}

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                {isOwner ? (
                  <p className="rounded-xl border border-dashed border-navy-200 px-5 py-4 text-sm text-navy-500">
                    This is your contribution. You'll be notified when someone asks to
                    borrow it.
                  </p>
                ) : book.available ? (
                  <button
                    onClick={openRequest}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-8 py-4 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <FiPackage /> Request to borrow
                  </button>
                ) : (
                  <button
                    disabled
                    className="cursor-not-allowed rounded-full bg-navy-200 px-8 py-4 text-sm font-bold text-navy-500"
                  >
                    Currently on loan
                  </button>
                )}

                <WishlistButton
                  book={{
                    source: "community",
                    bookId: id,
                    title: book.title,
                    author: book.author,
                    coverImage: book.coverImage,
                  }}
                />
              </div>

              <p className="mt-3 text-xs text-navy-400">
                Community books are borrow-only — they can't be purchased with points.
              </p>
            </div>
          </motion.div>
        </div>

        <ReviewSection source="community" bookId={id} />
      </section>

      <ShippingModal
        open={modalOpen}
        title="Request to borrow"
        subtitle={`Tell ${book.ownerName} where to parcel "${book.title}".`}
        confirmLabel="Send request"
        submitting={submitting}
        error={error}
        onClose={() => setModalOpen(false)}
        onSubmit={handleRequest}
      />
    </PageTransition>
  );
};

export default CommunityBookDetails;
