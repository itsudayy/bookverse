const admin = require("../lib/firebaseAdmin");
const Book = require("../models/Book");
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

    // Snapshot the book alongside the review. An official book is deleted when
    // someone buys it with points, and the reader's own review should still say
    // what it was about afterwards.
    let snapshot = {};
    if (source === "official") {
      const b = await Book.findById(bookId).select("title author coverImage");
      if (b) {
        snapshot = { bookTitle: b.title, bookAuthor: b.author, bookCover: b.coverImage };
      }
    }

    const review = {
      source,
      bookId,
      userUid: req.user.firebaseUid,
      userName: req.user.name,
      rating,
      text,
      ...snapshot,
      createdAt: FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(COLLECTIONS.reviews).add(review);

    res.status(201).json({ id: ref.id, ...review });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/mine — every review this user has written, across both
// shelves, enriched with each book's title and cover so the account page can
// render them without the client having to resolve two different id spaces.
async function listMyReviews(req, res, next) {
  try {
    const snap = await db
      .collection(COLLECTIONS.reviews)
      .where("userUid", "==", req.user.firebaseUid)
      .get();

    const reviews = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));

    // Resolve official books from Mongo and community books from Firestore in
    // batch, so N reviews don't fan out into N round-trips per store.
    const officialIds = [...new Set(reviews.filter((r) => r.source === "official").map((r) => r.bookId))];
    const communityIds = [...new Set(reviews.filter((r) => r.source === "community").map((r) => r.bookId))];

    const officialBooks = officialIds.length
      ? await Book.find({ _id: { $in: officialIds } }).select("title coverImage author")
      : [];
    const officialMap = Object.fromEntries(officialBooks.map((b) => [String(b._id), b]));

    const communityMap = {};
    await Promise.all(
      communityIds.map(async (id) => {
        const doc = await db.collection(COLLECTIONS.usedBooks).doc(id).get();
        if (doc.exists) communityMap[id] = doc.data();
      })
    );

    const enriched = reviews.map((r) => {
      const book = r.source === "official" ? officialMap[r.bookId] : communityMap[r.bookId];
      // Live book first so edits show through, then the snapshot taken when the
      // review was written — which is all that's left once a book is sold.
      return {
        ...r,
        bookTitle: book?.title || r.bookTitle || "Unknown book",
        bookAuthor: book?.author || r.bookAuthor || "",
        bookCover: book?.coverImage || r.bookCover || "",
        bookExists: Boolean(book),
      };
    });

    res.json(enriched);
  } catch (err) {
    next(err);
  }
}

module.exports = { listReviews, addReview, listMyReviews };
