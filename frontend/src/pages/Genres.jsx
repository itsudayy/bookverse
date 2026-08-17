import PageTransition from "../components/PageTransition";
import GenreCard from "../components/GenreCard";
import { genres } from "../data/genres";

const Genres = () => {
  return (
    <PageTransition>
      <section className="relative overflow-hidden bg-navy-950 py-24 text-center">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="container-app relative">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            Every Shelf, Every Story
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">
            Browse by Genre
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream-100/60">
            From distant galaxies to distant histories — pick a genre and let us guide
            you to your next read.
          </p>
        </div>
      </section>

      <section className="container-app py-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {genres.map((genre, i) => (
            <GenreCard key={genre.name} genre={genre} index={i} />
          ))}
        </div>
      </section>
    </PageTransition>
  );
};

export default Genres;
