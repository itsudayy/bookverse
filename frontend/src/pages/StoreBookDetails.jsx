import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiShoppingCart, FiCheck, FiBookOpen, FiTag } from "react-icons/fi";
import { fetchStoreBook } from "../services/storeService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";
import RatingStars from "../components/RatingStars";
import { taka } from "../utils/currency";

const StoreBookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const { add, inCart } = useCart();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStoreBook(id)
      .then(setBook)
      .catch((err) => console.error("Failed to load book", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!firebaseUser) {
      navigate("/login", { state: { from: `/store/${id}` } });
      return;
    }
    setAdding(true);
    try {
      await add(id);
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setAdding(false);
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
        <Link to="/store" className="font-semibold text-coral-600 hover:underline">
          Back to the Store
        </Link>
      </div>
    );
  }

  const added = inCart(book.id);

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
            <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-600">
              {book.category}
            </span>

            <h1 className="font-display mt-4 text-4xl leading-tight text-navy-900 sm:text-5xl">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-navy-400">by {book.author}</p>

            <div className="mt-4">
              <RatingStars rating={book.rating} size={16} />
            </div>

            <p className="font-display mt-6 text-4xl text-navy-900">{taka(book.price)}</p>
            <p className="mt-1 text-xs text-navy-400">Inclusive of all taxes</p>

            {book.description && (
              <p className="mt-6 max-w-2xl leading-relaxed text-navy-500">{book.description}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={handleAdd}
                disabled={adding}
                className={`flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-all duration-300 hover:-translate-y-1 disabled:opacity-60 ${
                  added
                    ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-coral hover:shadow-lg"
                }`}
              >
                {added ? <FiCheck /> : <FiShoppingCart />}
                {adding ? "Adding..." : added ? "Added to cart" : "Add to cart"}
              </button>

              {added && (
                <Link
                  to="/cart"
                  className="rounded-full border-2 border-indigo-600 px-8 py-4 text-sm font-bold text-indigo-600 transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-600 hover:text-white"
                >
                  Go to cart
                </Link>
              )}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { icon: FiBookOpen, label: "Genre", value: book.category },
                { icon: FiTag, label: "Price", value: taka(book.price) },
                { icon: FiCheck, label: "Availability", value: "In stock" },
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
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default StoreBookDetails;
