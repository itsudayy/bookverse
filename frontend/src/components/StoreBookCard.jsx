import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShoppingCart, FiCheck } from "react-icons/fi";
import BookCover from "./BookCover";
import RatingStars from "./RatingStars";
import { taka } from "../utils/currency";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const StoreBookCard = ({ book, index = 0 }) => {
  const { firebaseUser } = useAuth();
  const { add, inCart } = useCart();
  const navigate = useNavigate();

  const added = inCart(book.id);

  const handleAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firebaseUser) {
      navigate("/login", { state: { from: "/store" } });
      return;
    }
    try {
      await add(book.id);
    } catch (err) {
      console.error("Failed to add to cart", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: (index % 8) * 0.05 }}
      whileHover={{ y: -6 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100/60 bg-white shadow-sm transition-shadow duration-500 hover:shadow-card"
    >
      <Link to={`/store/${book.id}`} className="relative block aspect-[3/4] overflow-hidden bg-navy-800">
        <BookCover
          src={book.coverImage}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-indigo-600 backdrop-blur-md">
          {book.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          to={`/store/${book.id}`}
          className="font-display text-base leading-snug text-navy-900 line-clamp-2 hover:text-coral-600"
        >
          {book.title}
        </Link>
        <p className="mt-1 text-xs text-navy-400">{book.author}</p>

        <div className="mt-2">
          <RatingStars rating={book.rating} size={12} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="font-display text-xl text-navy-900">{taka(book.price)}</span>
          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
              added
                ? "bg-emerald-50 text-emerald-600"
                : "bg-gradient-to-r from-coral-500 to-coral-400 text-white shadow-coral hover:-translate-y-0.5"
            }`}
          >
            {added ? <FiCheck size={13} /> : <FiShoppingCart size={13} />}
            {added ? "In cart" : "Add"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreBookCard;
