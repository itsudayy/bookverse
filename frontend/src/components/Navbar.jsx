import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiBookOpen } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const links = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/community", label: "Community" },
  { to: "/genres", label: "Genres" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { profile, firebaseUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-navy-900/90 backdrop-blur-lg shadow-lg shadow-navy-950/20 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container-app flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-coral-500 to-indigo-600 text-cream-50 shadow-coral group-hover:rotate-6 transition-transform duration-300">
            <FiBookOpen size={18} />
          </span>
          <span className="font-display text-2xl tracking-tight text-cream-50">
            Book<span className="text-coral-400">verse</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-300 group ${
                  isActive ? "text-coral-400" : "text-cream-100/80 hover:text-cream-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {link.label}
                  <span
                    className={`absolute left-4 right-4 -bottom-0.5 h-[2px] bg-gradient-to-r from-coral-400 to-indigo-400 origin-left transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
          {firebaseUser && (
            <NavLink
              key="/my-library"
              to="/my-library"
              className={({ isActive }) =>
                `relative px-4 py-2 text-sm font-semibold tracking-wide transition-colors duration-300 group ${
                  isActive ? "text-coral-400" : "text-cream-100/80 hover:text-cream-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  My Library
                  <span
                    className={`absolute left-4 right-4 -bottom-0.5 h-[2px] bg-gradient-to-r from-coral-400 to-indigo-400 origin-left transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  onSubmit={handleSearch}
                  className="absolute right-11 top-1/2 -translate-y-1/2 overflow-hidden"
                >
                  <input
                    autoFocus
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search books..."
                    className="w-full rounded-full border border-cream-100/20 bg-navy-800/80 px-4 py-2 text-sm text-cream-50 placeholder:text-cream-200/40 outline-none focus:border-coral-400"
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-cream-100/80 hover:text-cream-50 hover:bg-cream-50/10 transition-colors duration-300"
              aria-label="Search"
            >
              <FiSearch size={18} />
            </button>
          </div>

          <NotificationBell />

          {firebaseUser ? (
            <div className="relative hidden lg:block">
              <button
                onClick={() => setUserMenuOpen((s) => !s)}
                className="flex items-center gap-2 rounded-full bg-cream-50/10 pl-1.5 pr-3 py-1.5 text-sm font-semibold text-cream-50 hover:bg-cream-50/20 transition-colors duration-300"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-coral-500 text-xs uppercase">
                  {profile?.name?.[0] || "?"}
                </span>
                {profile?.name?.split(" ")[0] || "Account"}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-card"
                  >
                    <Link
                      to="/my-library"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-navy-700 hover:bg-cream-100 transition-colors"
                    >
                      <FiUser size={15} /> My Library
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-coral-600 hover:bg-cream-100 transition-colors"
                    >
                      <FiLogOut size={15} /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-cream-100/90 hover:text-cream-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-gradient-to-r from-coral-500 to-coral-400 px-5 py-2 text-sm font-semibold text-white shadow-coral hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Register
              </Link>
            </div>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-cream-50 lg:hidden"
            onClick={() => setMenuOpen((s) => !s)}
            aria-label="Menu"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-navy-900/98 backdrop-blur-lg"
          >
            <div className="container-app flex flex-col gap-1 py-4">
              {[...links, ...(firebaseUser ? [{ to: "/my-library", label: "My Library" }] : [])].map(
                (link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-lg px-4 py-3 text-sm font-semibold ${
                        isActive ? "bg-coral-500/20 text-coral-400" : "text-cream-100/80"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                )
              )}
              <form onSubmit={handleSearch} className="px-4 py-2">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search books..."
                  className="w-full rounded-full border border-cream-100/20 bg-navy-800/80 px-4 py-2.5 text-sm text-cream-50 placeholder:text-cream-200/40 outline-none focus:border-coral-400"
                />
              </form>
              <div className="mt-2 flex gap-2 px-4">
                {firebaseUser ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="flex-1 rounded-full bg-coral-500 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 rounded-full border border-cream-100/30 px-4 py-2.5 text-center text-sm font-semibold text-cream-50"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 rounded-full bg-coral-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
