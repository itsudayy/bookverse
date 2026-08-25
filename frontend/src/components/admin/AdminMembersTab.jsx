import { Fragment, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUsers, FiBookOpen, FiClock, FiShield, FiChevronDown } from "react-icons/fi";
import { fetchMembers } from "../../services/adminService";

const AdminMembersTab = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchMembers()
      .then(setMembers)
      .catch((err) => console.error("Failed to load members", err))
      .finally(() => setLoading(false));
  }, []);

  const totalActiveLoans = members.reduce((s, m) => s + m.activeBorrowCount, 0);
  const admins = members.filter((m) => m.role === "admin").length;

  const statCards = [
    { label: "Total Members", value: members.length, icon: FiUsers, color: "text-indigo-600 bg-indigo-50" },
    { label: "Active Loans", value: totalActiveLoans, icon: FiClock, color: "text-coral-600 bg-coral-50" },
    { label: "Admins", value: admins, icon: FiShield, color: "text-navy-600 bg-navy-100" },
  ];

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—");

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-navy-900">Members</h2>
        <p className="mt-1 text-sm text-navy-400">
          Every registered reader, and what they currently have on loan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card">
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon size={17} />
            </span>
            <p className="mt-3 font-display text-2xl text-navy-900">{s.value}</p>
            <p className="text-xs text-navy-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream-100 text-xs font-bold uppercase tracking-wide text-navy-400">
              <tr>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Joined</th>
                <th className="px-5 py-4">Currently Borrowing</th>
                <th className="px-5 py-4">Lifetime Borrows</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-navy-400">
                    Loading members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-navy-400">
                    No members have signed up yet.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <Fragment key={m._id}>
                    <tr className="hover:bg-cream-50/70 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-coral-500 text-xs font-bold uppercase text-white">
                            {m.name?.[0] || "?"}
                          </span>
                          <div>
                            <p className="font-semibold text-navy-800">{m.name}</p>
                            <p className="text-xs text-navy-400">{m.email}</p>
                          </div>
                          {m.role === "admin" && (
                            <span className="ml-1 rounded-full bg-navy-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cream-50">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-navy-500">{formatDate(m.createdAt)}</td>
                      <td className="px-5 py-3">
                        {m.activeBorrowCount === 0 ? (
                          <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-bold text-navy-500">
                            Not borrowing
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 rounded-full bg-coral-50 px-2.5 py-1 text-xs font-bold text-coral-600">
                            <FiBookOpen size={12} /> {m.activeBorrowCount} book
                            {m.activeBorrowCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-navy-500">{m.totalBorrowCount}</td>
                      <td className="px-5 py-3 text-right">
                        {(m.activeBorrowCount > 0 || m.returnedCount > 0) && (
                          <button
                            onClick={() => setExpanded(expanded === m._id ? null : m._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-100 text-navy-600 transition-colors hover:bg-indigo-100 hover:text-indigo-600"
                          >
                            <FiChevronDown
                              size={14}
                              className={`transition-transform duration-300 ${
                                expanded === m._id ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </td>
                    </tr>

                    <AnimatePresence>
                      {expanded === m._id && (
                        <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <td colSpan={5} className="bg-cream-50/60 px-5 py-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              {m.activeBorrows.length > 0 && (
                                <div>
                                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-coral-600">
                                    Currently borrowing
                                  </p>
                                  <ul className="space-y-1.5">
                                    {m.activeBorrows.map((b, i) => (
                                      <li key={i} className="flex justify-between text-xs text-navy-600">
                                        <span className="font-semibold">{b.title}</span>
                                        <span className="text-navy-400">since {formatDate(b.borrowedAt)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {m.borrowHistory.length > 0 && (
                                <div>
                                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-navy-400">
                                    Reading history
                                  </p>
                                  <ul className="space-y-1.5">
                                    {m.borrowHistory.slice(0, 6).map((b, i) => (
                                      <li key={i} className="flex justify-between text-xs text-navy-600">
                                        <span className="font-semibold">{b.title}</span>
                                        <span className="text-navy-400">returned {formatDate(b.returnedAt)}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AdminMembersTab;
