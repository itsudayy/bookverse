import { Link } from "react-router-dom";
import { FiPackage, FiArrowRight } from "react-icons/fi";
import PageTransition from "../components/PageTransition";

// Placeholder for the upcoming Store, where books bought with real money will
// have orders to track. Wired into the account menu now so the navigation is
// complete; the real order history lands with the Store.
const Orders = () => (
  <PageTransition>
    <section className="bg-navy-950 py-16">
      <div className="container-app">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
          Your account
        </p>
        <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Orders &amp; Tracking</h1>
      </div>
    </section>

    <section className="container-app py-20">
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-navy-200 py-20 text-center">
        <FiPackage className="mx-auto mb-4 text-navy-300" size={40} />
        <p className="font-display text-2xl text-navy-700">No orders yet</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-navy-400">
          Order tracking arrives with the Bookverse Store, where you'll be able to buy
          books outright. For now, you can borrow or use points on the official
          Collection.
        </p>
        <Link
          to="/collection"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral-500 px-6 py-3 text-sm font-bold text-white shadow-coral transition-transform hover:-translate-y-0.5"
        >
          Browse the Collection <FiArrowRight />
        </Link>
      </div>
    </section>
  </PageTransition>
);

export default Orders;
