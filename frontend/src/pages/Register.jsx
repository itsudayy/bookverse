import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "../utils/authError";
import AuthLayout from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";

const Register = () => {
  const { signup, loginWithGoogle, firebaseUser, loading: authLoading, redirectError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Route off the restored auth state, so an already-signed-in visitor never
  // sees the register form and a popup sign-in lands somewhere useful.
  useEffect(() => {
    if (!authLoading && firebaseUser) navigate("/", { replace: true });
  }, [authLoading, firebaseUser, navigate]);

  useEffect(() => {
    if (redirectError) setError(friendlyAuthError(redirectError));
  }, [redirectError]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate("/", { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Bookverse and start borrowing in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-coral-600 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-navy-100 bg-white py-3.5 text-sm font-bold text-navy-700 transition-all duration-300 hover:border-navy-200 hover:bg-cream-50 hover:-translate-y-0.5 disabled:opacity-60"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-navy-100" />
        <span className="text-xs uppercase tracking-widest text-navy-300">or</span>
        <div className="h-px flex-1 bg-navy-100" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-coral-50 px-4 py-3 text-sm font-semibold text-coral-700">
            {error}
          </p>
        )}

        <div className="relative">
          <FiUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            className="w-full rounded-xl border border-navy-100 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-coral-400"
          />
        </div>

        <div className="relative">
          <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full rounded-xl border border-navy-100 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-coral-400"
          />
        </div>

        <div className="relative">
          <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            required
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full rounded-xl border border-navy-100 bg-white py-3.5 pl-11 pr-11 text-sm outline-none transition-colors focus:border-coral-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-500"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        <div className="relative">
          <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy-300" />
          <input
            required
            type={showPassword ? "text" : "password"}
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Confirm password"
            className="w-full rounded-xl border border-navy-100 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition-colors focus:border-coral-400"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3.5 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
