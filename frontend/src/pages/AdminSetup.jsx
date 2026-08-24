import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FiKey, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { bootstrapAdmin } from "../services/adminService";
import PageTransition from "../components/PageTransition";

const AdminSetup = () => {
  const { firebaseUser, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-navy-200 border-t-coral-500 animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" state={{ from: "/admin/setup" }} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await bootstrapAdmin(secret.trim());
      await refreshProfile();
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify that admin key.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <section className="container-app flex min-h-[70vh] items-center justify-center py-20">
        <div className="w-full max-w-md rounded-2xl border border-navy-100 bg-white p-8 shadow-card">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-coral-500 text-white">
            <FiShield size={22} />
          </span>
          <h1 className="font-display text-2xl text-navy-900">Admin access</h1>
          <p className="mt-2 text-sm text-navy-400">
            {profile?.role === "admin"
              ? "This account already has admin access."
              : "Enter the Bookverse admin key to grant this account admin rights. You only need to do this once."}
          </p>

          {profile?.role === "admin" ? (
            <button
              onClick={() => navigate("/admin")}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3.5 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-0.5"
            >
              Go to Admin Dashboard
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <p className="rounded-lg bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700">
                  {error}
                </p>
              )}
              <div className="relative">
                <FiKey className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
                <input
                  required
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Admin key"
                  className="w-full rounded-xl border border-navy-100 bg-cream-50 py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-coral-400"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3.5 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {submitting ? "Verifying..." : "Grant admin access"}
              </button>
            </form>
          )}
        </div>
      </section>
    </PageTransition>
  );
};

export default AdminSetup;
