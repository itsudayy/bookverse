const admin = require("../lib/firebaseAdmin");
const { db, COLLECTIONS } = require("../lib/firestore");

const { FieldValue } = admin.firestore;

const SOURCES = ["official", "community"];

// A wishlist item stores who saved it, which shelf the book is on, its id, and
// a denormalized copy of the display fields so the wishlist page renders in one
// read without resolving two different id spaces. Firestore, per the project's
// "new features use Firestore" rule.
async function listWishlist(req, res, next) {
  try {
    const snap = await db
      .collection(COLLECTIONS.wishlist)
      .where("userUid", "==", req.user.firebaseUid)
      .get();

    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    res.json(items);
  } catch (err) {
    next(err);
  }
}

// POST /api/wishlist — save a book. Idempotent: saving the same book twice
// returns the existing entry instead of creating a duplicate.
async function addToWishlist(req, res, next) {
  try {
    const { source, bookId, title, author, coverImage } = req.body;
    if (!SOURCES.includes(source) || !bookId || !title) {
      return res.status(400).json({ message: "source, bookId and title are required" });
    }

    const existing = await db
      .collection(COLLECTIONS.wishlist)
      .where("userUid", "==", req.user.firebaseUid)
      .where("source", "==", source)
      .where("bookId", "==", bookId)
      .get();
    if (!existing.empty) {
      const doc = existing.docs[0];
      return res.json({ id: doc.id, ...doc.data() });
    }

    const item = {
      userUid: req.user.firebaseUid,
      source,
      bookId,
      title,
      author: author || "",
      coverImage: coverImage || "",
      createdAt: FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(COLLECTIONS.wishlist).add(item);

    res.status(201).json({ id: ref.id, ...item });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/wishlist/:source/:bookId — remove by the book it points at, so
// the client can toggle without tracking the wishlist document id.
async function removeFromWishlist(req, res, next) {
  try {
    const { source, bookId } = req.params;
    const snap = await db
      .collection(COLLECTIONS.wishlist)
      .where("userUid", "==", req.user.firebaseUid)
      .where("source", "==", source)
      .where("bookId", "==", bookId)
      .get();

    const batch = db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    res.json({ message: "Removed", count: snap.size });
  } catch (err) {
    next(err);
  }
}

module.exports = { listWishlist, addToWishlist, removeFromWishlist };
