const admin = require("../lib/firebaseAdmin");
const { db, COLLECTIONS } = require("../lib/firestore");

const { FieldValue } = admin.firestore;

// Reviews cover both shelves, so a review is keyed by the book's id AND which
// collection it came from — an official Mongo _id and a Firestore usedBook id
// live in different id spaces and could otherwise collide.
const SOURCES = ["official", "community"];

// GET /api/reviews/:source/:bookId
async function listReviews(req, res, next) {
  try {
    const { source, bookId } = req.params;
    if (!SOURCES.includes(source)) {
      return res.status(400).json({ message: "Unknown book source" });
    }

    const snap = await db
      .collection(COLLECTIONS.reviews)
      .where("source", "==", source)
      .where("bookId", "==", bookId)
      .get();

    const reviews = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    const average = reviews.length
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;

    res.json({ reviews, average: Number(average.toFixed(2)), count: reviews.length });
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews/:source/:bookId
async function addReview(req, res, next) {
  try {
    const { source, bookId } = req.params;
    if (!SOURCES.includes(source)) {
      return res.status(400).json({ message: "Unknown book source" });
    }

    const rating = Number(req.body.rating);
    const text = (req.body.text || "").trim();
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // One review per person per book, so a single user can't skew a rating.
    const existing = await db
      .collection(COLLECTIONS.reviews)
      .where("source", "==", source)
      .where("bookId", "==", bookId)
      .where("userUid", "==", req.user.firebaseUid)
      .get();
    if (!existing.empty) {
      return res.status(400).json({ message: "You have already reviewed this book" });
    }

    const review = {
      source,
      bookId,
      userUid: req.user.firebaseUid,
      userName: req.user.name,
      rating,
      text,
      createdAt: FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(COLLECTIONS.reviews).add(review);

    res.status(201).json({ id: ref.id, ...review });
  } catch (err) {
    next(err);
  }
}

module.exports = { listReviews, addReview };
