import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiBookOpen, FiUsers, FiClock, FiGrid, FiArrowRight } from "react-icons/fi";
import PageTransition from "../components/PageTransition";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6 },
};

const values = [
  {
    title: "Curated, not just cataloged",
    desc: "Every title in Bookverse is chosen with care — a collection built to be explored, not just searched.",
    color: "from-coral-500 to-coral-400",
  },
  {
    title: "Access for every reader",
    desc: "No waiting lists, no late fees, no barriers. Just an open shelf, available around the clock.",
    color: "from-indigo-600 to-indigo-400",
  },
  {
    title: "Designed for discovery",
    desc: "Genres, ratings, and editorial picks work together to lead you somewhere new.",
    color: "from-navy-700 to-navy-500",
  },
];

const About = () => {
  return (
    <PageTransition>
      {/* HERO */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-navy-950 pb-20">
        <img
          src="https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=2400&q=80"
          alt="Reading room"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/10" />
        <div className="container-app relative">
          <motion.p
            {...fadeUp}
            className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-coral-400"
          >
            Our Story
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="font-display max-w-3xl text-5xl leading-tight text-cream-50 sm:text-6xl"
          >
            A library reimagined for the way we read now.
          </motion.h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="container-app py-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <motion.div {...fadeUp}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
              Why Bookverse
            </p>
            <h2 className="font-display text-4xl leading-tight text-navy-900 sm:text-5xl">
              Founded on a simple idea: every reader deserves an open door.
            </h2>
            <p className="mt-6 leading-relaxed text-navy-500">
              Bookverse began as a small experiment — could a library feel as fast and
              intuitive as the rest of the internet, without losing the warmth of
              wandering through real shelves? Today, Bookverse is home to thousands of
              titles across every genre, built for readers who want discovery without
              friction.
            </p>
            <p className="mt-4 leading-relaxed text-navy-500">
              We believe the best libraries aren't just storage for books — they're
              spaces designed to spark the next thing you fall in love with reading.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
              alt="Stack of books"
              className="aspect-[4/5] w-full rounded-3xl object-cover shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* VALUES - colorful accent sections */}
      <section className="bg-cream-100 py-24">
        <div className="container-app">
          <motion.div {...fadeUp} className="mb-14 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-600">
              What We Stand For
            </p>
            <h2 className="font-display text-4xl text-navy-900">The Bookverse Promise</h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.12 }}
                className="overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-card transition-shadow duration-500"
              >
                <div className={`h-2 w-full bg-gradient-to-r ${v.color}`} />
                <div className="p-7">
                  <h3 className="font-display text-xl text-navy-900">{v.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-500">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-indigo-800 to-coral-700 py-20">
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="container-app relative grid grid-cols-2 gap-8 text-center text-cream-50 sm:grid-cols-4">
          {[
            { icon: FiBookOpen, value: "10K+", label: "Books" },
            { icon: FiGrid, value: "25+", label: "Genres" },
            { icon: FiUsers, value: "50K+", label: "Readers" },
            { icon: FiClock, value: "24/7", label: "Access" },
          ].map((s, i) => (
            <motion.div key={s.label} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }}>
              <s.icon className="mx-auto mb-3 text-coral-300" size={26} />
              <p className="font-display text-4xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-cream-100/60">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CLOSING */}
      <section className="container-app py-24 text-center">
        <motion.h2 {...fadeUp} className="font-display mx-auto max-w-2xl text-4xl text-navy-900 sm:text-5xl">
          Come wander the shelves.
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="mx-auto mt-4 max-w-md text-navy-400"
        >
          Your next favorite book is somewhere in Bookverse. Let's go find it.
        </motion.p>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="mt-8">
          <Link
            to="/collection"
            className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-navy-800"
          >
            Explore the Collection <FiArrowRight />
          </Link>
        </motion.div>
      </section>
    </PageTransition>
  );
};

export default About;
