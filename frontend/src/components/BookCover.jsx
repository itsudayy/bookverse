const FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect width='400' height='600' fill='%23161d3f'/%3E%3Ctext x='200' y='300' font-family='serif' font-size='28' fill='%23ff9c78' text-anchor='middle' dominant-baseline='middle'%3EBookverse%3C/text%3E%3C/svg%3E";

const BookCover = ({ src, alt, className }) => {
  return (
    <img
      src={src || FALLBACK}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = FALLBACK;
      }}
      className={className}
    />
  );
};

export default BookCover;
