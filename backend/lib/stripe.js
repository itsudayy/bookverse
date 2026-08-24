const Stripe = require("stripe");

// Prices throughout the Store are Bangladeshi Taka. Stripe takes amounts in the
// currency's smallest unit, and BDT has two decimals, so ৳450 is sent as 45000.
const CURRENCY = "bdt";
const toStripeAmount = (taka) => Math.round(Number(taka) * 100);

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key ? new Stripe(key) : null;

if (!stripe) {
  console.warn(
    "STRIPE_SECRET_KEY is missing — the Store will load but checkout is disabled until it is set."
  );
}

module.exports = { stripe, CURRENCY, toStripeAmount };
