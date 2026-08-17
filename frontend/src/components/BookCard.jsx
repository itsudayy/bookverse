import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import BookCover from "./BookCover";
import RatingStars from "./RatingStars";

const BookCard = ({ book, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06 }}
      whileHover={{ y: -8 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-navy-100/60 shadow-sm hover:shadow-card transition-shadow duration-500"
    >
      <Link to={`/books/${book._id}`} className="relative block aspect-[3/4] overflow-hidden bg-navy-800">
        <BookCover
          src={book.coverImage}
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/0 to-navy-950/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <span
          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur-md transition-all duration-300 group-hover:scale-105 ${
            book.available
              ? "bg-emerald-500/90 text-white"
              : "bg-navy-900/80 text-cream-100"
          }`}
        >
          {book.available ? "Available" : "Borrowed"}
        </span>

        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-indigo-600 backdrop-blur-md">
          {book.category}
        </span>

        <div className="absolute inset-x-0 bottom-0 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 p-3">
          <span className="flex items-center justify-center gap-1.5 rounded-full bg-coral-500 py-2 text-xs font-bold text-white shadow-coral">
            View Book <FiArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-snug text-navy-900 line-clamp-2">
          {book.title}
        </h3>
        <p className="mt-1 text-sm text-navy-400">{book.author}</p>
        <div className="mt-3 flex items-center justify-between">
          <RatingStars rating={book.rating} size={12} />
          <span className="text-xs font-medium text-navy-300">{book.publishedYear}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BookCard;
