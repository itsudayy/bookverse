import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell } from "react-icons/fi";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const NotificationBell = () => {
  const { firebaseUser } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // A live Firestore listener, so a borrow request reaches the owner the moment
  // it is created rather than on their next page load. Writes still go through
  // the API — this subscription is read-only.
  useEffect(() => {
    if (!firestore || !firebaseUser) {
      setItems([]);
      return;
    }
    const q = query(
      collection(firestore, "notifications"),
      where("userUid", "==", firebaseUser.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setItems(list);
      },
      (err) => console.error("Notification listener failed", err)
    );
    return unsubscribe;
  }, [firebaseUser]);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((i) => !i.read).length;

  const markAllRead = async () => {
    if (!unread) return;
    try {
      await api.post("/notifications/read-all");
    } catch (err) {
      console.error("Failed to mark notifications read", err);
    }
  };

  if (!firebaseUser) return null;

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => {
          setOpen((s) => !s);
          if (!open) markAllRead();
        }}
        aria-label="Notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-cream-100/80 transition-colors duration-300 hover:bg-cream-50/10 hover:text-cream-50"
      >
        <FiBell size={18} />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-card"
          >
            <div className="border-b border-navy-100 px-4 py-3">
              <p className="text-sm font-bold text-navy-900">Notifications</p>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-navy-400">
                Nothing here yet.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {items.slice(0, 12).map((n) => (
                  <div
                    key={n.id}
                    className={`border-b border-navy-100/60 px-4 py-3 last:border-0 ${
                      n.read ? "" : "bg-coral-50/40"
                    }`}
                  >
                    <p className="text-sm font-semibold text-navy-800">{n.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-navy-500">{n.body}</p>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/my-library"
              onClick={() => setOpen(false)}
              className="block border-t border-navy-100 px-4 py-3 text-center text-xs font-bold text-indigo-600 hover:bg-cream-100"
            >
              Manage requests in My Library
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
