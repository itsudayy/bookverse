const admin = require("../lib/firebaseAdmin");
const Book = require("../models/Book");
const {
  db,
  COLLECTIONS,
  POINTS_PER_CONTRIBUTION,
  POINTS_TO_PURCHASE,
} = require("../lib/firestore");

const { FieldValue } = admin.firestore;

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
    const idNumber = (req.body.shippingIdNumber || "").trim();
    const address = (req.body.shippingAddress || "").trim();
    if (!name || !idNumber || !address) {
      return res
        .status(400)
        .json({ message: "Name, ID and home address are required to purchase" });
    }

    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const userRef = db.collection(COLLECTIONS.users).doc(req.user.firebaseUid);

    // A transaction so two concurrent purchases can't both spend the same
    // points — the balance is re-read and checked inside the transaction.
    const result = await db.runTransaction(async (tx) => {
      const userDoc = await tx.get(userRef);
      const balance = userDoc.exists ? userDoc.data().points || 0 : 0;
      if (balance < POINTS_TO_PURCHASE) {
        return { ok: false, balance };
      }

      const already = await tx.get(
        db
          .collection(COLLECTIONS.purchases)
          .where("userUid", "==", req.user.firebaseUid)
          .where("bookId", "==", req.params.bookId)
      );
      if (!already.empty) return { ok: false, duplicate: true, balance };

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
        shipping: { name, idNumber, address },
        createdAt: FieldValue.serverTimestamp(),
      });
      return { ok: true, balance: balance - POINTS_TO_PURCHASE };
    });

    if (!result.ok) {
      if (result.duplicate) {
        return res.status(400).json({ message: "You already own this book" });
      }
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
