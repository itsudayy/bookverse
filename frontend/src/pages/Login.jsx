import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { friendlyAuthError } from "../utils/authError";
import AuthLayout from "../components/AuthLayout";
import GoogleIcon from "../components/GoogleIcon";

const Login = () => {
  const { login, loginWithGoogle, firebaseUser, loading: authLoading, redirectError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Google sign-in via redirect reloads the page, so route on the restored
  // session rather than on handleGoogle's return value.
  useEffect(() => {
    if (!authLoading && firebaseUser) navigate(from, { replace: true });
  }, [authLoading, firebaseUser, navigate, from]);

  useEffect(() => {
    if (redirectError) setError(friendlyAuthError(redirectError));
  }, [redirectError]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
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
      // null means we fell back to a redirect — the browser is navigating away,
      // so there's nothing to route to here.
      const user = await loginWithGoogle();
      if (user) navigate(from, { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue exploring your library."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-coral-600 hover:underline">
            Register
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3.5 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
