import { useState } from "react";
import { FiBookOpen, FiShoppingBag, FiUsers } from "react-icons/fi";
import PageTransition from "../components/PageTransition";
import AdminCollectionTab from "../components/admin/AdminCollectionTab";
import AdminStoreTab from "../components/admin/AdminStoreTab";
import AdminMembersTab from "../components/admin/AdminMembersTab";

const TABS = [
  { id: "collection", label: "Library Collection", icon: FiBookOpen },
  { id: "store", label: "Store", icon: FiShoppingBag },
  { id: "members", label: "Members", icon: FiUsers },
];

const Admin = () => {
  const [tab, setTab] = useState("collection");

  return (
    <PageTransition>
      <section className="bg-navy-950 py-14">
        <div className="container-app">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
            Admin
          </p>
          <h1 className="font-display text-3xl text-cream-50 sm:text-4xl">Admin Dashboard</h1>
        </div>
      </section>

      <section className="container-app -mt-6 relative z-10 pb-24">
        <div className="mb-8 flex gap-2 overflow-x-auto rounded-2xl border border-navy-100 bg-white p-1.5 shadow-card">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors duration-200 ${
                tab === t.id
                  ? "bg-navy-900 text-cream-50"
                  : "text-navy-500 hover:bg-cream-100"
              }`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "collection" && <AdminCollectionTab />}
        {tab === "store" && <AdminStoreTab />}
        {tab === "members" && <AdminMembersTab />}
      </section>
    </PageTransition>
  );
};

export default Admin;
