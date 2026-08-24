import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiBookOpen,
  FiHeart,
  FiStar,
  FiPackage,
  FiShoppingCart,
  FiChevronDown,
  FiAward,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import NotificationBell from "./NotificationBell";

const links = [
  { to: "/", label: "Home" },
  { to: "/collection", label: "Collection" },
  { to: "/community", label: "Community" },
  { to: "/store", label: "Store" },
  { to: "/genres", label: "Genres" },
  { to: "/about", label: "About" },
];

// The account dropdown. Some land on real pages (Wishlist, Rating & Reviews,
// My Library, Account Info); Orders & Tracking is a placeholder for the Store
// that's coming later.
const accountLinks = [
  { to: "/account", label: "Account Info", icon: FiUser },
  { to: "/orders", label: "Orders & Tracking", icon: FiPackage },
  { to: "/account/reviews", label: "Rating & Reviews", icon: FiStar },
  { to: "/wishlist", label: "Wishlist", icon: FiHeart },
  { to: "/my-library", label: "My Library", icon: FiBookOpen },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { profile, firebaseUser, points, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const { cart } = useCart();
  const navigate = useNavigate();
  const closeTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hover open/close with a small close delay, so moving the cursor from the
  // trigger down into the menu doesn't dismiss it. Click still toggles for
  // touch devices.
  const openMenu = () => {
    clearTimeout(closeTimer.current);
    setUserMenuOpen(true);
  };
  const closeMenuSoon = () => {
    closeTimer.current = setTimeout(() => setUserMenuOpen(false), 160);
  };

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

  const iconBtn =
    "flex h-10 w-10 items-center justify-center rounded-full text-cream-100/80 hover:text-cream-50 hover:bg-cream-50/10 transition-colors duration-300";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-navy-900/90 backdrop-blur-lg shadow-lg shadow-navy-950/20 py-3"
          : "bg-navy-950/70 backdrop-blur-sm py-5"
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
        </nav>

        <div className="flex items-center gap-1.5">
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
            <button onClick={() => setSearchOpen((s) => !s)} className={iconBtn} aria-label="Search">
              <FiSearch size={18} />
            </button>
          </div>

          {firebaseUser ? (
            <>
              {/* Points balance */}
              <Link
                to="/my-library"
                title="Your contribution points"
                className="hidden items-center gap-1.5 rounded-full bg-cream-50/10 px-3 py-1.5 text-sm font-bold text-cream-50 transition-colors duration-300 hover:bg-cream-50/20 sm:flex"
              >
                <FiAward size={15} className="text-amber-400" />
                {points?.points ?? 0}
                <span className="text-cream-100/60">Pts</span>
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className={`relative hidden sm:flex ${iconBtn}`} aria-label="Wishlist">
                <FiHeart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
                    {wishlistItems.length > 9 ? "9+" : wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className={`relative hidden sm:flex ${iconBtn}`}
                aria-label="Cart"
                title="Cart"
              >
                <FiShoppingCart size={18} />
                {cart.count > 0 && (
                  <span className="absolute right-1 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-500 px-1 text-[10px] font-bold text-white">
                    {cart.count > 9 ? "9+" : cart.count}
                  </span>
                )}
              </Link>

              <NotificationBell />

              {/* Account dropdown (hover) */}
              <div
                className="relative hidden lg:block"
                onMouseEnter={openMenu}
                onMouseLeave={closeMenuSoon}
              >
                <button
                  onClick={() => setUserMenuOpen((s) => !s)}
                  className="flex items-center gap-2 rounded-full bg-cream-50/10 pl-1.5 pr-2.5 py-1.5 text-sm font-semibold text-cream-50 transition-colors duration-300 hover:bg-cream-50/20"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-coral-500 text-xs uppercase">
                    {profile?.name?.[0] || "?"}
                  </span>
                  {profile?.name?.split(" ")[0] || "Account"}
                  <FiChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      // top-full + pt-3 keeps a hoverable bridge between the
                      // trigger and the card instead of a dead margin gap.
                      className="absolute right-0 top-full w-60 pt-3"
                    >
                      <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-card">
                        <div className="border-b border-navy-100 px-4 py-3">
                          <p className="text-sm font-bold text-navy-900">{profile?.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-amber-500">
                            <FiAward size={12} /> {points?.points ?? 0} points
                          </p>
                        </div>
                        {accountLinks.map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-navy-700 transition-colors hover:bg-cream-100"
                          >
                            <item.icon size={15} className="text-navy-400" /> {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 border-t border-navy-100 px-4 py-2.5 text-sm font-medium text-coral-600 transition-colors hover:bg-cream-100"
                        >
                          <FiLogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
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
              {links.map((link) => (
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
              ))}

              {firebaseUser && (
                <>
                  <div className="my-2 border-t border-cream-100/10" />
                  <div className="mb-1 flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-400">
                    <FiAward size={15} /> {points?.points ?? 0} points
                  </div>
                  {accountLinks.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold ${
                          isActive ? "bg-coral-500/20 text-coral-400" : "text-cream-100/80"
                        }`
                      }
                    >
                      <item.icon size={15} /> {item.label}
                    </NavLink>
                  ))}
                  <NavLink
                    to="/cart"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-cream-100/80"
                  >
                    <FiShoppingCart size={15} /> Cart
                  </NavLink>
                </>
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
                    Sign Out
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
