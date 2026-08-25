const admin = require("../lib/firebaseAdmin");
const { db, COLLECTIONS } = require("../lib/firestore");
const { stripe, CURRENCY, toStripeAmount } = require("../lib/stripe");
const { buildCart } = require("./cartController");

const { FieldValue } = admin.firestore;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// POST /api/checkout/session — start a Stripe Checkout for the signed-in
// user's cart.
async function createCheckoutSession(req, res, next) {
  try {
    if (!stripe) {
      return res
        .status(503)
        .json({ message: "Payments aren't configured yet. STRIPE_SECRET_KEY is missing." });
    }

    // Rebuilt from the catalogue, so every amount charged comes from our own
    // data — the client never gets to say what anything costs.
    const cart = await buildCart(req.user.firebaseUid);
    if (cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: req.user.email,
      line_items: cart.items.map((i) => ({
        price_data: {
          currency: CURRENCY,
          product_data: {
            name: i.title,
            description: `by ${i.author}`,
            images: i.coverImage ? [i.coverImage] : undefined,
          },
          unit_amount: toStripeAmount(i.price),
        },
        quantity: i.quantity,
      })),
      // The uid is read back from the session on return, so a returning browser
      // can't claim someone else's order.
      metadata: {
        userUid: req.user.firebaseUid,
        itemCount: String(cart.count),
      },
      // Both outcomes return to the cart, which confirms the payment and
      // switches itself into a receipt rather than bouncing through a
      // separate page.
      success_url: `${CLIENT_URL}/cart?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/cart?canceled=1`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    next(err);
  }
}

// GET /api/checkout/confirm/:sessionId — called by the success page. Verifies
// the payment with Stripe, records the order once, and empties the cart.
async function confirmCheckout(req, res, next) {
  try {
    if (!stripe) {
      return res.status(503).json({ message: "Payments aren't configured yet." });
    }

    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
      expand: ["line_items"],
    });

    if (session.metadata?.userUid !== req.user.firebaseUid) {
      return res.status(403).json({ message: "This checkout doesn't belong to you." });
    }
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "This payment hasn't completed." });
    }

    // Reloading the success page must not create a second order.
    const existing = await db
      .collection(COLLECTIONS.orders)
      .where("stripeSessionId", "==", session.id)
      .get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      return res.json({ id: doc.id, ...doc.data(), alreadyRecorded: true });
    }

    const items = (session.line_items?.data || []).map((li) => ({
      title: li.description,
      quantity: li.quantity,
      lineTotal: li.amount_total / 100,
    }));

    const order = {
      userUid: req.user.firebaseUid,
      userName: req.user.name,
      email: session.customer_details?.email || req.user.email,
      items,
      total: session.amount_total / 100,
      currency: (session.currency || CURRENCY).toUpperCase(),
      stripeSessionId: session.id,
      paymentStatus: session.payment_status,
      status: "paid",
      createdAt: FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(COLLECTIONS.orders).add(order);

    await db
      .collection(COLLECTIONS.carts)
      .doc(req.user.firebaseUid)
      .set({ items: [], updatedAt: FieldValue.serverTimestamp() }, { merge: true });

    res.status(201).json({ id: ref.id, ...order });
  } catch (err) {
    next(err);
  }
}

// GET /api/checkout/orders
async function listMyOrders(req, res, next) {
  try {
    const snap = await db
      .collection(COLLECTIONS.orders)
      .where("userUid", "==", req.user.firebaseUid)
      .get();
    const orders = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

module.exports = { createCheckoutSession, confirmCheckout, listMyOrders };
