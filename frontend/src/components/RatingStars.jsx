import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const RatingStars = ({ rating = 0, size = 14, showValue = true }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-1 text-coral-400">
      {Array.from({ length: full }).map((_, i) => (
        <FaStar key={`f${i}`} size={size} />
      ))}
      {half && <FaStarHalfAlt size={size} />}
      {Array.from({ length: empty }).map((_, i) => (
        <FaRegStar key={`e${i}`} size={size} className="text-navy-200" />
      ))}
      {showValue && (
        <span className="ml-1 text-xs font-semibold text-navy-500">{rating.toFixed(1)}</span>
      )}
    </div>
  );
};

export default RatingStars;
