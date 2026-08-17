import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBookOpen, FiClock, FiCheckCircle } from "react-icons/fi";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";

const MyLibrary = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);

  const fetchRecords = async () => {
    try {
      const { data } = await api.get("/borrowed/me");
      setRecords(data);
    } catch (err) {
      console.error("Failed to load borrowed books", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleReturn = async (bookId) => {
    setReturningId(bookId);
    try {
      await api.post(`/books/${bookId}/return`);
      fetchRecords();
    } catch (err) {
      console.error("Failed to return book", err);
    } finally {
      setReturningId(null);
    }
  };

  const active = records.filter((r) => r.status === "borrowed");
  const past = records.filter((r) => r.status === "returned");

  return (
    <PageTransition>
      <section className="bg-navy-950 py-16">
        <div className="container-app">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            Hello, {user?.name?.split(" ")[0]}
          </p>
          <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">My Library</h1>
          <p className="mt-3 max-w-xl text-cream-100/60">
            Track everything you've borrowed and return books when you're finished.
          </p>
        </div>
      </section>

      <section className="container-app py-16">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-navy-100/50" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-200 py-20 text-center">
            <FiBookOpen className="mx-auto mb-4 text-navy-300" size={36} />
            <p className="font-display text-2xl text-navy-700">
              You haven't borrowed any books yet
            </p>
            <Link
              to="/collection"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-coral hover:-translate-y-0.5 transition-transform"
            >
              Browse the Collection
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2">
              <FiClock className="text-coral-500" />
              <h2 className="font-display text-2xl text-navy-900">Currently Borrowed</h2>
            </div>
            {active.length === 0 ? (
              <p className="mb-12 text-sm text-navy-400">No active borrows right now.</p>
            ) : (
              <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {active.map((record) => (
                    <motion.div
                      key={record._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                      className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm hover:shadow-card transition-shadow duration-300"
                    >
                      <Link to={`/books/${record.bookId?._id}`} className="shrink-0">
                        <BookCover
                          src={record.bookId?.coverImage}
                          alt={record.bookId?.title}
                          className="h-28 w-20 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <h3 className="font-display text-base leading-snug text-navy-900 line-clamp-2">
                          {record.bookId?.title || "Untitled"}
                        </h3>
                        <p className="mt-1 text-xs text-navy-400">{record.bookId?.author}</p>
                        <p className="mt-2 text-[11px] font-semibold text-navy-300">
                          Borrowed {new Date(record.borrowedAt).toLocaleDateString()}
                        </p>
                        <span className="mt-1 w-fit rounded-full bg-coral-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-coral-600">
                          Borrowed
                        </span>
                        <button
                          onClick={() => handleReturn(record.bookId?._id)}
                          disabled={returningId === record.bookId?._id}
                          className="mt-auto pt-3 text-left text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                        >
                          {returningId === record.bookId?._id ? "Returning..." : "Return Book"}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {past.length > 0 && (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-500" />
                  <h2 className="font-display text-2xl text-navy-900">Reading History</h2>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((record) => (
                    <div
                      key={record._id}
                      className="flex gap-4 rounded-2xl border border-navy-100 bg-cream-100/60 p-4"
                    >
                      <Link to={`/books/${record.bookId?._id}`} className="shrink-0">
                        <BookCover
                          src={record.bookId?.coverImage}
                          alt={record.bookId?.title}
                          className="h-28 w-20 rounded-lg object-cover grayscale-[30%]"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <h3 className="font-display text-base leading-snug text-navy-800 line-clamp-2">
                          {record.bookId?.title || "Untitled"}
                        </h3>
                        <p className="mt-1 text-xs text-navy-400">{record.bookId?.author}</p>
                        <p className="mt-2 text-[11px] font-semibold text-navy-300">
                          Returned {new Date(record.returnedAt).toLocaleDateString()}
                        </p>
                        <span className="mt-1 w-fit rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                          Returned
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>
    </PageTransition>
  );
};

export default MyLibrary;
