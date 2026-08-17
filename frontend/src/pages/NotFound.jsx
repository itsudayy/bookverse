import { Link } from "react-router-dom";
import PageTransition from "../components/PageTransition";

const NotFound = () => (
  <PageTransition>
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-8xl text-indigo-200">404</p>
      <h1 className="font-display mt-4 text-3xl text-navy-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-navy-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-coral hover:-translate-y-0.5 transition-transform"
      >
        Back to Home
      </Link>
    </div>
  </PageTransition>
);

export default NotFound;
