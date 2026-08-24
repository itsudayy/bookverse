import { Link } from "react-router-dom";
import { FiBookOpen, FiInstagram, FiTwitter, FiGithub, FiMail } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Footer = () => {
  const { profile } = useAuth();

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-cream-100/70">
      <div className="absolute inset-0 bg-grid-fade opacity-40 pointer-events-none" />
      <div className="container-app relative py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 w-fit">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-coral-500 to-indigo-600 text-cream-50 shadow-coral">
                <FiBookOpen size={18} />
              </span>
              <span className="font-display text-2xl text-cream-50">
                Book<span className="text-coral-400">verse</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed">
              A modern digital library built for readers who love discovery. Thousands of
              titles, curated genres, and a home for every story you haven't read yet.
            </p>
            <div className="mt-6 flex gap-3">
              {[FiInstagram, FiTwitter, FiGithub, FiMail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream-100/15 text-cream-100/70 hover:border-coral-400 hover:text-coral-400 hover:-translate-y-1 transition-all duration-300"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-cream-50">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                ["Collection", "/collection"],
                ["Genres", "/genres"],
                ["About Bookverse", "/about"],
                ["My Library", "/my-library"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-coral-400 transition-colors duration-300">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-cream-50">
              Account
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/login" className="hover:text-coral-400 transition-colors duration-300">
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="hover:text-coral-400 transition-colors duration-300"
                >
                  Register
                </Link>
              </li>
              {profile?.role === "admin" && (
                <li>
                  <Link to="/admin" className="hover:text-coral-400 transition-colors duration-300">
                    Admin
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-cream-100/10 pt-8 text-xs text-cream-100/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Bookverse. All rights reserved.</p>
          <p>Read. Discover. Explore.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
