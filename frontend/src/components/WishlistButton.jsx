import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";

// `book` must carry { source, bookId, title, author, coverImage }.
// variant "pill" is the labelled button on detail pages; "icon" is a bare heart
// for corners of cards.
const WishlistButton = ({ book, variant = "pill" }) => {
  const { firebaseUser } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const navigate = useNavigate();

  const saved = isWishlisted(book.source, book.bookId);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firebaseUser) {
      navigate("/login");
      return;
    }
    toggle(book);
  };

  if (variant === "icon") {
    return (
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleClick}
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-sm transition-colors duration-300 hover:bg-white"
      >
        <FiHeart
          size={16}
          className={saved ? "fill-coral-500 text-coral-500" : "text-navy-400"}
        />
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-full border-2 px-6 py-4 text-sm font-bold transition-all duration-300 hover:-translate-y-1 ${
        saved
          ? "border-coral-500 bg-coral-50 text-coral-600"
          : "border-navy-200 text-navy-600 hover:border-coral-400 hover:text-coral-500"
      }`}
    >
      <FiHeart size={16} className={saved ? "fill-coral-500 text-coral-500" : ""} />
      {saved ? "Wishlisted" : "Wishlist"}
    </motion.button>
  );
};

export default WishlistButton;
