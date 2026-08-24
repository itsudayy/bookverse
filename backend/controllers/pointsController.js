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

// Undoes the claim made before spending points, so a failed payment doesn't
// strand a book as sold-but-never-paid-for.
async function releaseClaim(bookId) {
  await Book.findByIdAndUpdate(bookId, {
    $set: { purchased: false, available: true, purchasedBy: null, purchasedAt: null },
  });
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
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.purchased) {
      return res.status(400).json({
        message:
          book.purchasedBy === req.user.firebaseUid
            ? "You already own this book."
            : "This copy has already been purchased by another reader.",
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
    // single transaction spanning both. Claim the copy first with one atomic
    // conditional update — whoever wins this update owns the sale — then spend
    // the points, and release the claim if that fails.
    const claimed = await Book.findOneAndUpdate(
      // $ne: true rather than false — books seeded before this field existed
      // have no `purchased` key at all, and an equality match skips those.
      { _id: book._id, available: true, purchased: { $ne: true } },
      {
        $set: {
          purchased: true,
          available: false,
          purchasedBy: req.user.firebaseUid,
          purchasedAt: new Date(),
        },
      },
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
