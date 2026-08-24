import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiBookOpen, FiUsers, FiClock, FiGrid } from "react-icons/fi";
import api from "../services/api";
import PageTransition from "../components/PageTransition";
import BookCard from "../components/BookCard";
import GenreCard from "../components/GenreCard";
import { genres } from "../data/genres";

const editorialPicks = [
  {
    title: "Slow mornings, deep reading",
    tag: "Editor's Note",
    desc: "There's a particular kind of quiet that comes with a coffee, a window seat, and a book you can't put down.",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "The books that shaped 2025",
    tag: "Reading List",
    desc: "From quiet literary triumphs to genre-defining epics — the titles our readers couldn't stop talking about.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Building a reading habit",
    tag: "Guide",
    desc: "Small, consistent choices compound. Here's how our most active readers keep the pages turning.",
    image:
      "https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=900&q=80",
  },
];

const stats = [
  { label: "Books", value: "10K+", icon: FiBookOpen },
  { label: "Genres", value: "25+", icon: FiGrid },
  { label: "Readers", value: "50K+", icon: FiUsers },
  { label: "Access", value: "24/7", icon: FiClock },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get("/books", { params: { sort: "rating" } });
        setFeatured(data.slice(0, 8));
      } catch (err) {
        console.error("Failed to load featured books", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return (
    <PageTransition>
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy-950">
        <img
          src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=2400&q=80"
          alt="Grand library interior"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/30 to-transparent" />
        <div className="absolute inset-0 bg-grid-fade" />

        <div className="container-app relative pt-24">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-cream-100/20 bg-cream-50/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-coral-400 backdrop-blur-sm"
          >
            Welcome to Bookverse
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display max-w-4xl text-5xl font-semibold leading-[1.05] text-cream-50 sm:text-6xl lg:text-7xl"
          >
            READ.{" "}
            <span className="text-gradient">DISCOVER.</span>
            <br />
            EXPLORE.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-cream-100/75"
          >
            Bookverse is a digital library built for people who love to read. Browse
            thousands of titles, borrow instantly, and find your next favorite story
            across every genre imaginable.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/collection"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-7 py-3.5 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              Explore Collection
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/genres"
              className="rounded-full border border-cream-100/25 px-7 py-3.5 text-sm font-bold text-cream-50 backdrop-blur-sm transition-all duration-300 hover:border-cream-50 hover:bg-cream-50/10 hover:-translate-y-1"
            >
              Browse Genres
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 grid max-w-lg grid-cols-4 gap-6 border-t border-cream-100/10 pt-8"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl text-cream-50">{s.value}</p>
                <p className="text-xs text-cream-100/50">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="container-app py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-500">
              Handpicked for you
            </p>
            <h2 className="font-display text-4xl text-navy-900">Featured Books</h2>
          </div>
          <Link
            to="/collection"
            className="group flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            View full collection
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-navy-100/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((book, i) => (
              <BookCard key={book._id} book={book} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* POPULAR GENRES */}
      <section className="bg-navy-950 py-24">
        <div className="container-app">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
              Find your shelf
            </p>
            <h2 className="font-display text-4xl text-cream-50">Popular Genres</h2>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {genres.map((genre, i) => (
              <GenreCard key={genre.name} genre={genre} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* WHAT ARE YOU READING NEXT */}
      <section className="container-app py-24">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-500">
            Editorial
          </p>
          <h2 className="font-display text-4xl text-navy-900">
            What Are You Reading Next?
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {editorialPicks.map((pick, i) => (
            <motion.div
              key={pick.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="group overflow-hidden rounded-2xl border border-navy-100/60 bg-white shadow-sm transition-shadow duration-500 hover:shadow-card"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={pick.image}
                  alt={pick.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-coral-600">
                  {pick.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl text-navy-900">{pick.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-400">{pick.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ABOUT LIBRA TEASER */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-coral-600 py-24">
        <div className="container-app grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=80"
              alt="Reader in a library"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-white p-5 shadow-xl sm:block">
              <p className="font-display text-3xl text-navy-900">10K+</p>
              <p className="text-xs font-semibold text-navy-400">Books &amp; growing</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-cream-50"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cream-50/70">
              About Bookverse
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              A library built for the way you actually read.
            </h2>
            <p className="mt-6 max-w-lg text-cream-50/80 leading-relaxed">
              Bookverse brings together a vast, thoughtfully curated collection with a
              fast, modern borrowing experience. No lines, no late fees — just you and
              your next great read, available whenever inspiration strikes.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <s.icon className="mb-2 text-coral-300" size={20} />
                  <p className="font-display text-2xl">{s.value}</p>
                  <p className="text-xs text-cream-50/60">{s.label}</p>
                </div>
              ))}
            </div>
            <Link
              to="/about"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-cream-50 px-6 py-3 text-sm font-bold text-navy-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Learn our story <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-navy-950 py-28 text-center">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="container-app relative">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display mx-auto max-w-2xl text-4xl text-cream-50 sm:text-5xl"
          >
            Your next favorite book is waiting.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-4 max-w-md text-cream-100/60"
          >
            Create a free account and start borrowing from thousands of titles today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-8 py-4 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              Join Bookverse Free <FiArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;
