import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-400 py-3.5 text-sm font-bold text-white shadow-coral transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
