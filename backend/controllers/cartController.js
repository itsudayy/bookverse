const admin = require("../lib/firebaseAdmin");
const { db, COLLECTIONS } = require("../lib/firestore");

const { FieldValue } = admin.firestore;

const cartRef = (uid) => db.collection(COLLECTIONS.carts).doc(uid);

// The cart stores only ids and quantities. Prices and titles are re-read from
// the catalogue on every load, so a stale cart can never carry an old price and
// a client can never suggest one.
async function buildCart(uid) {
  const doc = await cartRef(uid).get();
  const raw = doc.exists ? doc.data().items || [] : [];
  if (raw.length === 0) return { items: [], subtotal: 0, count: 0 };

  const books = await Promise.all(
    raw.map(async (i) => {
      const b = await db.collection(COLLECTIONS.storeBooks).doc(i.bookId).get();
      return b.exists ? { id: b.id, ...b.data() } : null;
    })
  );

  const items = [];
  raw.forEach((i, idx) => {
    const book = books[idx];
    if (!book) return; // dropped from the catalogue since it was added
    items.push({
      bookId: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      category: book.category,
      price: book.price,
      quantity: i.quantity,
      lineTotal: book.price * i.quantity,
    });
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return { items, subtotal, count };
}

async function getCart(req, res, next) {
  try {
    res.json(await buildCart(req.user.firebaseUid));
  } catch (err) {
    next(err);
  }
}

// POST /api/cart — add (or bump the quantity of) one title
async function addToCart(req, res, next) {
  try {
    const { bookId } = req.body;
    const quantity = Math.max(1, Number(req.body.quantity) || 1);
    if (!bookId) return res.status(400).json({ message: "bookId is required" });

    const book = await db.collection(COLLECTIONS.storeBooks).doc(bookId).get();
    if (!book.exists) return res.status(404).json({ message: "Book not found in the Store" });

    const ref = cartRef(req.user.firebaseUid);
    const doc = await ref.get();
    const items = doc.exists ? doc.data().items || [] : [];

    const existing = items.find((i) => i.bookId === bookId);
    if (existing) existing.quantity += quantity;
    else items.push({ bookId, quantity });

    await ref.set(
      { userUid: req.user.firebaseUid, items, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );

    res.status(201).json(await buildCart(req.user.firebaseUid));
  } catch (err) {
    next(err);
  }
}

// PATCH /api/cart/:bookId — set an exact quantity; 0 removes the line
async function updateCartItem(req, res, next) {
  try {
    const quantity = Number(req.body.quantity);
    if (Number.isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: "quantity must be 0 or more" });
    }

    const ref = cartRef(req.user.firebaseUid);
    const doc = await ref.get();
    let items = doc.exists ? doc.data().items || [] : [];

    items = quantity === 0
      ? items.filter((i) => i.bookId !== req.params.bookId)
      : items.map((i) => (i.bookId === req.params.bookId ? { ...i, quantity } : i));

    await ref.set({ items, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    res.json(await buildCart(req.user.firebaseUid));
  } catch (err) {
    next(err);
  }
}

async function removeFromCart(req, res, next) {
  try {
    const ref = cartRef(req.user.firebaseUid);
    const doc = await ref.get();
    const items = (doc.exists ? doc.data().items || [] : []).filter(
      (i) => i.bookId !== req.params.bookId
    );
    await ref.set({ items, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    res.json(await buildCart(req.user.firebaseUid));
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    await cartRef(req.user.firebaseUid).set(
      { items: [], updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    res.json({ items: [], subtotal: 0, count: 0 });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, buildCart };
