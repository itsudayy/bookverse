const admin = require("../lib/firebaseAdmin");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const {
  db,
  COLLECTIONS,
  POINTS_PER_CONTRIBUTION,
  POINTS_TO_PURCHASE,
} = require("../lib/firestore");

const { FieldValue } = admin.firestore;

// Puts the copy back on the shelf when a sale doesn't complete, so a failed
// payment doesn't leave a book stuck as permanently unavailable.
async function releaseClaim(bookId) {
  await Book.findByIdAndUpdate(bookId, { $set: { available: true } });
}

// The Book document is about to be deleted, so anything that still refers to it
// keeps its own copy of the details first. Without this a reader's history and
// their reviews would lose the title they were about.
async function preserveReferences(book) {
  const snapshot = {
    title: book.title,
    author: book.author,
    coverImage: book.coverImage,
  };

  await Borrow.updateMany(
    { bookId: book._id, "bookSnapshot.title": { $exists: false } },
    { $set: { bookSnapshot: snapshot } }
  );

  const bookId = String(book._id);

  const reviews = await db
    .collection(COLLECTIONS.reviews)
    .where("source", "==", "official")
    .where("bookId", "==", bookId)
    .get();
  const reviewBatch = db.batch();
  reviews.docs.forEach((d) =>
    reviewBatch.update(d.ref, {
      bookTitle: snapshot.title,
      bookAuthor: snapshot.author,
      bookCover: snapshot.coverImage,
    })
  );
  await reviewBatch.commit();

  // The book can never be borrowed or bought again, so leaving it on anyone's
  // wishlist would only produce a dead link.
  const wishes = await db
    .collection(COLLECTIONS.wishlist)
    .where("source", "==", "official")
    .where("bookId", "==", bookId)
    .get();
  const wishBatch = db.batch();
  wishes.docs.forEach((d) => wishBatch.delete(d.ref));
  await wishBatch.commit();
}

// GET /api/points/me — balance plus the economy's rates, so the UI never has
// to hard-code numbers that the server is the authority on.
async function getMyPoints(req, res, next) {
  try {
    const doc = await db.collection(COLLECTIONS.users).doc(req.user.firebaseUid).get();
    res.json({
      points: doc.exists ? doc.data().points || 0 : 0,
      pointsPerContribution: POINTS_PER_CONTRIBUTION,
      pointsToPurchase: POINTS_TO_PURCHASE,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/points/purchases — books this user owns permanently
async function listMyPurchases(req, res, next) {
  try {
    const snap = await db
      .collection(COLLECTIONS.purchases)
      .where("userUid", "==", req.user.firebaseUid)
      .get();
    const purchases = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    res.json(purchases);
  } catch (err) {
    next(err);
  }
}

// POST /api/points/purchase/:bookId — buy an OFFICIAL book permanently.
// Community books are borrow-only and deliberately have no equivalent route.
async function purchaseOfficialBook(req, res, next) {
  try {
    const name = (req.body.shippingName || "").trim();
    const phone = (req.body.shippingPhone || "").trim();
    const address = (req.body.shippingAddress || "").trim();
    if (!name || !phone || !address) {
      return res
        .status(400)
        .json({ message: "Name, phone number and home address are required to purchase" });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) {
      // Already bought by someone else — the document is gone for good.
      return res.status(404).json({
        message: "This book is no longer in the collection — it may have just been purchased.",
      });
    }

    // The library lends one copy; it can't be posted to a buyer while someone
    // else is reading it.
    if (!book.available) {
      const mine = await Borrow.findOne({
        bookId: book._id,
        userId: req.user._id,
        status: "borrowed",
      });
      return res.status(400).json({
        message: mine
          ? "You're currently borrowing this book. Return it first, then you can buy it."
          : "This book is currently borrowed by another reader, so it can't be purchased yet.",
      });
    }

    // MongoDB holds the book and Firestore holds the points, so there is no
    // single transaction spanning both. Reserve the copy first with one atomic
    // conditional update — whoever wins this update owns the sale — then spend
    // the points, and put it back if that fails.
    const claimed = await Book.findOneAndUpdate(
      { _id: book._id, available: true },
      { $set: { available: false } },
      { new: true }
    );
    if (!claimed) {
      return res.status(400).json({
        message: "This book was just taken by someone else. Please refresh and try again.",
      });
    }

    const userRef = db.collection(COLLECTIONS.users).doc(req.user.firebaseUid);

    let result;
    try {
      // A transaction so two concurrent purchases can't both spend the same
      // points — the balance is re-read and checked inside the transaction.
      result = await db.runTransaction(async (tx) => {
        const userDoc = await tx.get(userRef);
        const balance = userDoc.exists ? userDoc.data().points || 0 : 0;
        if (balance < POINTS_TO_PURCHASE) {
          return { ok: false, balance };
        }

        tx.set(
          userRef,
          { points: FieldValue.increment(-POINTS_TO_PURCHASE) },
          { merge: true }
        );
        tx.set(db.collection(COLLECTIONS.purchases).doc(), {
          userUid: req.user.firebaseUid,
          userName: req.user.name,
          bookId: req.params.bookId,
          bookTitle: book.title,
          bookAuthor: book.author,
          bookCover: book.coverImage,
          pointsSpent: POINTS_TO_PURCHASE,
          shipping: { name, phone, address },
          createdAt: FieldValue.serverTimestamp(),
        });
        return { ok: true, balance: balance - POINTS_TO_PURCHASE };
      });
    } catch (err) {
      await releaseClaim(book._id);
      throw err;
    }

    if (!result.ok) {
      // Payment didn't go through, so put the copy back on the shelf.
      await releaseClaim(book._id);
      return res.status(400).json({
        message: `Not enough points. This book costs ${POINTS_TO_PURCHASE}, you have ${result.balance}.`,
      });
    }

    // Paid for — the copy leaves the library for good. Snapshot it onto the
    // records that outlive it before removing the document.
    await preserveReferences(book);
    await Book.findByIdAndDelete(book._id);

    res.status(201).json({
      message: "Book purchased",
      pointsSpent: POINTS_TO_PURCHASE,
      points: result.balance,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyPoints, listMyPurchases, purchaseOfficialBook };
