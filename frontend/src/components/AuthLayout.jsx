import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiBookOpen } from "react-icons/fi";

const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy-950 lg:block">
        <img
          src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80"
          alt="Cozy library shelves"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/60 to-navy-950/20" />
        <div className="absolute inset-0 bg-grid-fade" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-coral-500 to-indigo-600 text-cream-50 shadow-coral">
              <FiBookOpen size={18} />
            </span>
            <span className="font-display text-2xl text-cream-50">
              Book<span className="text-coral-400">verse</span>
            </span>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <p className="font-display text-3xl leading-tight text-cream-50">
              "A room without books is like a body without a soul."
            </p>
            <p className="mt-4 text-sm text-cream-100/60">— Marcus Tullius Cicero</p>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16 sm:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden w-fit">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-coral-500 to-indigo-600 text-cream-50 shadow-coral">
              <FiBookOpen size={18} />
            </span>
            <span className="font-display text-2xl text-navy-900">
              Book<span className="text-coral-500">verse</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl text-navy-900">{title}</h1>
          <p className="mt-2 text-sm text-navy-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-8 text-center text-sm text-navy-400">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
