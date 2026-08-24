import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiBookOpen,
  FiClock,
  FiCheckCircle,
  FiPlus,
  FiAward,
  FiInbox,
  FiSend,
  FiTrash2,
  FiShoppingBag,
} from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  fetchMyUsedBooks,
  addUsedBook,
  removeUsedBook,
  fetchRequests,
  respondToRequest,
  returnUsedBook,
} from "../services/communityService";
import { fetchMyPoints, fetchMyPurchases } from "../services/pointsService";
import PageTransition from "../components/PageTransition";
import BookCover from "../components/BookCover";
import AddUsedBookModal from "../components/AddUsedBookModal";

const TABS = [
  { id: "borrowed", label: "Borrowed", icon: FiClock },
  { id: "contributions", label: "My Contributions", icon: FiBookOpen },
  { id: "requests", label: "Requests", icon: FiInbox },
  { id: "purchased", label: "Purchased", icon: FiShoppingBag },
];

const MyLibrary = () => {
  const { profile, refreshPoints } = useAuth();
  const location = useLocation();
  // Arriving straight from a purchase: open on the tab holding the new book.
  const [tab, setTab] = useState(location.state?.purchased ? "purchased" : "borrowed");

  const [records, setRecords] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [requests, setRequests] = useState({ incoming: [], outgoing: [] });
  const [points, setPoints] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [busyId, setBusyId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [toast, setToast] = useState(location.state?.purchased || null);

  const loadAll = async () => {
    try {
      const [borrowRes, mine, reqs, pts, purch] = await Promise.all([
        api.get("/borrowed/me"),
        fetchMyUsedBooks(),
        fetchRequests(),
        fetchMyPoints(),
        fetchMyPurchases(),
      ]);
      setRecords(borrowRes.data);
      setMyBooks(mine);
      setRequests(reqs);
      setPoints(pts);
      setPurchases(purch);
      // Keep the navbar's points badge in step with this page.
      refreshPoints();
    } catch (err) {
      console.error("Failed to load your library", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleReturn = async (bookId) => {
    setBusyId(bookId);
    try {
      await api.post(`/books/${bookId}/return`);
      loadAll();
    } catch (err) {
      console.error("Failed to return book", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleAddBook = async (form, reset) => {
    setSubmitting(true);
    setModalError("");
    try {
      const res = await addUsedBook(form);
      setModalOpen(false);
      reset();
      setToast(`Thanks for sharing! You earned ${res.pointsAwarded} points.`);
      setTimeout(() => setToast(null), 5000);
      loadAll();
    } catch (err) {
      setModalError(err.response?.data?.message || "Could not share that book.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id) => {
    setBusyId(id);
    try {
      await removeUsedBook(id);
      loadAll();
    } catch (err) {
      console.error("Failed to remove book", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleRespond = async (id, action) => {
    setBusyId(id);
    try {
      await respondToRequest(id, action);
      loadAll();
    } catch (err) {
      console.error("Failed to answer request", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleReturnUsed = async (id) => {
    setBusyId(id);
    try {
      await returnUsedBook(id);
      loadAll();
    } catch (err) {
      console.error("Failed to return book", err);
    } finally {
      setBusyId(null);
    }
  };

  const active = records.filter((r) => r.status === "borrowed");
  const past = records.filter((r) => r.status === "returned");
  const pendingCount = requests.incoming.filter((r) => r.status === "pending").length;

  return (
    <PageTransition>
      <section className="bg-navy-950 py-16">
        <div className="container-app">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
                Hello, {profile?.name?.split(" ")[0]}
              </p>
              <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">My Library</h1>
              <p className="mt-3 max-w-xl text-cream-100/60">
                Your loans, the books you've shared with the community, and the points
                you've earned.
              </p>
            </div>

            <div className="rounded-2xl border border-cream-100/15 bg-cream-50/5 px-6 py-4 backdrop-blur-sm">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-coral-400">
                <FiAward size={13} /> Contribution points
              </span>
              <p className="font-display mt-1 text-4xl text-cream-50">{points?.points ?? 0}</p>
              <p className="mt-1 text-[11px] text-cream-100/50">
                {points?.pointsToPurchase ?? 200} buys an official book
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setModalError("");
              setModalOpen(true);
            }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-6 py-3 text-sm font-bold text-white shadow-coral transition-transform hover:-translate-y-0.5"
          >
            <FiPlus /> Add a used book
          </button>
        </div>
      </section>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="container-app pt-6"
          >
            <p className="rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
              {toast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="container-app py-12">
        <div className="mb-8 flex flex-wrap gap-2 border-b border-navy-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors ${
                tab === t.id ? "text-coral-600" : "text-navy-400 hover:text-navy-700"
              }`}
            >
              <t.icon size={15} />
              {t.label}
              {t.id === "requests" && pendingCount > 0 && (
                <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral-500 px-1.5 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
              {tab === t.id && (
                <motion.span
                  layoutId="mylib-tab"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-coral-500"
                />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-navy-100/50" />
            ))}
          </div>
        ) : (
          <>
            {/* ---------- BORROWED (official collection) ---------- */}
            {tab === "borrowed" && (
              <>
                {active.length === 0 && past.length === 0 ? (
                  <EmptyState
                    icon={FiBookOpen}
                    title="You haven't borrowed any books yet"
                    action={{ to: "/collection", label: "Browse the Collection" }}
                  />
                ) : (
                  <>
                    <SectionHeading icon={FiClock} label="Currently Borrowed" />
                    {active.length === 0 ? (
                      <p className="mb-12 text-sm text-navy-400">No active borrows right now.</p>
                    ) : (
                      <div className="mb-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {active.map((r) => (
                          <div
                            key={r._id}
                            className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm"
                          >
                            <Link to={`/books/${r.bookId?._id}`} className="shrink-0">
                              <BookCover
                                src={r.bookId?.coverImage}
                                alt={r.bookId?.title}
                                className="h-28 w-20 rounded-lg object-cover"
                              />
                            </Link>
                            <div className="flex flex-1 flex-col">
                              <h3 className="font-display text-base leading-snug text-navy-900 line-clamp-2">
                                {r.bookId?.title || "Untitled"}
                              </h3>
                              <p className="mt-1 text-xs text-navy-400">{r.bookId?.author}</p>
                              <p className="mt-2 text-[11px] font-semibold text-navy-300">
                                Borrowed {new Date(r.borrowedAt).toLocaleDateString()}
                              </p>
                              <button
                                onClick={() => handleReturn(r.bookId?._id)}
                                disabled={busyId === r.bookId?._id}
                                className="mt-auto pt-3 text-left text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                              >
                                {busyId === r.bookId?._id ? "Returning..." : "Return Book"}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {past.length > 0 && (
                      <>
                        <SectionHeading icon={FiCheckCircle} label="Reading History" tone="emerald" />
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {past.map((r) => (
                            <div
                              key={r._id}
                              className="flex gap-4 rounded-2xl border border-navy-100 bg-cream-100/60 p-4"
                            >
                              <BookCover
                                src={r.bookId?.coverImage}
                                alt={r.bookId?.title}
                                className="h-28 w-20 rounded-lg object-cover grayscale-[30%]"
                              />
                              <div>
                                <h3 className="font-display text-base leading-snug text-navy-800 line-clamp-2">
                                  {r.bookId?.title || "Untitled"}
                                </h3>
                                <p className="mt-1 text-xs text-navy-400">{r.bookId?.author}</p>
                                <p className="mt-2 text-[11px] font-semibold text-navy-300">
                                  Returned {new Date(r.returnedAt).toLocaleDateString()}
                                </p>
                                {r.bookGone && (
                                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-navy-300">
                                    No longer in the library
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* ---------- MY CONTRIBUTIONS ---------- */}
            {tab === "contributions" && (
              <>
                {myBooks.length === 0 ? (
                  <EmptyState
                    icon={FiBookOpen}
                    title="You haven't shared any books yet"
                    subtitle={`Share a book you've finished with and earn ${
                      points?.pointsPerContribution ?? 50
                    } points.`}
                  />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {myBooks.map((b) => (
                      <div
                        key={b.id}
                        className="flex gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm"
                      >
                        <Link to={`/community/${b.id}`} className="shrink-0">
                          <BookCover
                            src={b.coverImage}
                            alt={b.title}
                            className="h-28 w-20 rounded-lg object-cover"
                          />
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <h3 className="font-display text-base leading-snug text-navy-900 line-clamp-2">
                            {b.title}
                          </h3>
                          <p className="mt-1 text-xs text-navy-400">{b.author}</p>
                          <span
                            className={`mt-2 w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                              b.available
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-coral-50 text-coral-600"
                            }`}
                          >
                            {b.available ? "Available" : "On loan"}
                          </span>
                          <button
                            onClick={() => handleRemove(b.id)}
                            disabled={busyId === b.id || !b.available}
                            title={b.available ? "Remove" : "Can't remove while on loan"}
                            className="mt-auto flex items-center gap-1.5 pt-3 text-left text-xs font-bold text-coral-600 hover:text-coral-700 disabled:opacity-40"
                          >
                            <FiTrash2 size={12} />
                            {busyId === b.id ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---------- REQUESTS ---------- */}
            {tab === "requests" && (
              <>
                <SectionHeading icon={FiInbox} label="Requests for your books" />
                {requests.incoming.length === 0 ? (
                  <p className="mb-12 text-sm text-navy-400">No one has asked to borrow your books yet.</p>
                ) : (
                  <div className="mb-14 space-y-3">
                    {requests.incoming.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-wrap items-center gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm"
                      >
                        <BookCover src={r.bookCover} alt={r.bookTitle} className="h-20 w-14 rounded-lg object-cover" />
                        <div className="min-w-[200px] flex-1">
                          <p className="font-display text-base text-navy-900">{r.bookTitle}</p>
                          <p className="mt-0.5 text-xs text-navy-400">
                            Requested by <span className="font-semibold">{r.requesterName}</span>
                          </p>
                          {r.status === "approved" && (
                            <p className="mt-1.5 text-[11px] leading-relaxed text-navy-500">
                              Deliver to: {r.shipping?.name}, {r.shipping?.address} (Phone:{" "}
                              {r.shipping?.phone})
                            </p>
                          )}
                        </div>
                        {r.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRespond(r.id, "approve")}
                              disabled={busyId === r.id}
                              className="rounded-full bg-emerald-500 px-5 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRespond(r.id, "decline")}
                              disabled={busyId === r.id}
                              className="rounded-full border border-navy-200 px-5 py-2 text-xs font-bold text-navy-600 transition-colors hover:bg-cream-100 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <StatusPill status={r.status} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <SectionHeading icon={FiSend} label="Requests you've sent" />
                {requests.outgoing.length === 0 ? (
                  <p className="text-sm text-navy-400">
                    You haven't asked to borrow any community books yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {requests.outgoing.map((r) => (
                      <div
                        key={r.id}
                        className="flex flex-wrap items-center gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm"
                      >
                        <BookCover src={r.bookCover} alt={r.bookTitle} className="h-20 w-14 rounded-lg object-cover" />
                        <div className="min-w-[200px] flex-1">
                          <p className="font-display text-base text-navy-900">{r.bookTitle}</p>
                          <p className="mt-0.5 text-xs text-navy-400">
                            {r.status === "pending"
                              ? "Waiting for the owner to respond"
                              : r.status === "approved"
                              ? "Approved — on its way to you"
                              : r.status === "returned"
                              ? "You returned this book"
                              : "The owner declined this request"}
                          </p>
                        </div>
                        {r.status === "approved" ? (
                          <button
                            onClick={() => handleReturnUsed(r.id)}
                            disabled={busyId === r.id}
                            className="rounded-full bg-indigo-600 px-5 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                          >
                            {busyId === r.id ? "Returning..." : "Return book"}
                          </button>
                        ) : (
                          <StatusPill status={r.status} />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ---------- PURCHASED ---------- */}
            {tab === "purchased" && (
              <>
                {purchases.length === 0 ? (
                  <EmptyState
                    icon={FiShoppingBag}
                    title="You haven't purchased any books yet"
                    subtitle={`Spend ${
                      points?.pointsToPurchase ?? 200
                    } points on an official Collection book to own it permanently.`}
                    action={{ to: "/collection", label: "Browse the Collection" }}
                  />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {purchases.map((p) => (
                      <div
                        key={p.id}
                        className="flex gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4"
                      >
                        <BookCover src={p.bookCover} alt={p.bookTitle} className="h-28 w-20 rounded-lg object-cover" />
                        <div>
                          <h3 className="font-display text-base leading-snug text-navy-900 line-clamp-2">
                            {p.bookTitle}
                          </h3>
                          <p className="mt-1 text-xs text-navy-400">{p.bookAuthor}</p>
                          <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                            <FiAward size={10} /> Owned · {p.pointsSpent} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </section>

      <AddUsedBookModal
        open={modalOpen}
        pointsPerContribution={points?.pointsPerContribution ?? 50}
        submitting={submitting}
        error={modalError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddBook}
      />
    </PageTransition>
  );
};

const SectionHeading = ({ icon: Icon, label, tone = "coral" }) => (
  <div className="mb-4 flex items-center gap-2">
    <Icon className={tone === "emerald" ? "text-emerald-500" : "text-coral-500"} />
    <h2 className="font-display text-2xl text-navy-900">{label}</h2>
  </div>
);

const StatusPill = ({ status }) => {
  const styles = {
    approved: "bg-emerald-50 text-emerald-600",
    declined: "bg-navy-100 text-navy-500",
    returned: "bg-indigo-50 text-indigo-600",
    pending: "bg-coral-50 text-coral-600",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
        styles[status] || styles.pending
      }`}
    >
      {status}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, subtitle, action }) => (
  <div className="rounded-2xl border border-dashed border-navy-200 py-20 text-center">
    <Icon className="mx-auto mb-4 text-navy-300" size={36} />
    <p className="font-display text-2xl text-navy-700">{title}</p>
    {subtitle && <p className="mx-auto mt-2 max-w-sm text-sm text-navy-400">{subtitle}</p>}
    {action && (
      <Link
        to={action.to}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-coral transition-transform hover:-translate-y-0.5"
      >
        {action.label}
      </Link>
    )}
  </div>
);

export default MyLibrary;
