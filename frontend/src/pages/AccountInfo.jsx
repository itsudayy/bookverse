import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiAward, FiShield, FiCalendar, FiArrowRight } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import PageTransition from "../components/PageTransition";

const AccountInfo = () => {
  const { profile, points } = useAuth();

  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  const rows = [
    { icon: FiUser, label: "Name", value: profile?.name || "—" },
    { icon: FiMail, label: "Email", value: profile?.email || "—" },
    {
      icon: FiShield,
      label: "Account type",
      value: profile?.role === "admin" ? "Administrator" : "Member",
    },
    { icon: FiCalendar, label: "Member since", value: joined },
  ];

  return (
    <PageTransition>
      <section className="bg-navy-950 py-16">
        <div className="container-app flex flex-wrap items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-coral-500 text-2xl font-bold uppercase text-white">
              {profile?.name?.[0] || "?"}
            </span>
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
                Your account
              </p>
              <h1 className="font-display text-4xl text-cream-50">{profile?.name}</h1>
            </div>
          </div>

          <div className="rounded-2xl border border-cream-100/15 bg-cream-50/5 px-6 py-4 backdrop-blur-sm">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-400">
              <FiAward size={13} /> Contribution points
            </span>
            <p className="font-display mt-1 text-4xl text-cream-50">{points?.points ?? 0}</p>
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-navy-100 bg-white p-2 shadow-sm">
            {rows.map((r, i) => (
              <motion.div
                key={r.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-4 border-b border-navy-100/60 px-4 py-4 last:border-0"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-100 text-indigo-600">
                  <r.icon size={17} />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-navy-400">
                    {r.label}
                  </p>
                  <p className="text-sm font-semibold text-navy-800">{r.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <Link
              to="/account/reviews"
              className="group flex items-center justify-between rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div>
                <p className="font-display text-lg text-navy-900">Rating &amp; Reviews</p>
                <p className="mt-0.5 text-xs text-navy-400">Every review you've written</p>
              </div>
              <FiArrowRight className="text-coral-500 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/wishlist"
              className="group flex items-center justify-between rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div>
                <p className="font-display text-lg text-navy-900">Wishlist</p>
                <p className="mt-0.5 text-xs text-navy-400">Books you've saved for later</p>
              </div>
              <FiArrowRight className="text-coral-500 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/my-library"
              className="group flex items-center justify-between rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div>
                <p className="font-display text-lg text-navy-900">My Library</p>
                <p className="mt-0.5 text-xs text-navy-400">Loans, contributions &amp; points</p>
              </div>
              <FiArrowRight className="text-coral-500 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default AccountInfo;
