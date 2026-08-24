import { Link } from "react-router-dom";
import { FiShoppingCart, FiArrowRight } from "react-icons/fi";
import PageTransition from "../components/PageTransition";

// Placeholder until the Store ships. The cart only becomes meaningful once
// books can be bought with real money, so it's intentionally empty for now.
const Cart = () => (
  <PageTransition>
    <section className="bg-navy-950 py-16">
      <div className="container-app">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-coral-400">
          Your cart
        </p>
        <h1 className="font-display text-4xl text-cream-50 sm:text-5xl">Shopping Cart</h1>
      </div>
    </section>

    <section className="container-app py-20">
      <div className="mx-auto max-w-md rounded-2xl border border-dashed border-navy-200 py-20 text-center">
        <FiShoppingCart className="mx-auto mb-4 text-navy-300" size={40} />
        <p className="font-display text-2xl text-navy-700">Your cart is empty</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-navy-400">
          The cart comes alive with the Bookverse Store. Until then, browse the Collection
          to borrow books or spend your contribution points.
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

export default Cart;
