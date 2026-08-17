import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const GenreCard = ({ genre, index = 0 }) => {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.06 }}
      whileHover={{ y: -6 }}
      onClick={() => navigate(`/collection?category=${encodeURIComponent(genre.name)}`)}
      className="group relative h-72 w-full overflow-hidden rounded-2xl text-left shadow-sm hover:shadow-card transition-shadow duration-500"
    >
      <img
        src={genre.image}
        alt={genre.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-navy-950/10 transition-opacity duration-500 group-hover:from-indigo-900/95 group-hover:via-navy-950/50" />

      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <h3 className="font-display text-2xl text-cream-50 transition-transform duration-500 group-hover:-translate-y-1">
          {genre.name}
        </h3>
        <p className="mt-1 text-sm text-cream-100/70 transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-16 group-hover:opacity-100 overflow-hidden">
          {genre.description}
        </p>
        <span className="mt-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-coral-400 opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
          Browse <FiArrowRight />
        </span>
      </div>
    </motion.button>
  );
};

export default GenreCard;
