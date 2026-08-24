const express = require("express");
const Borrow = require("../models/Borrow");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

// GET /api/borrowed/me
router.get("/me", verifyFirebaseToken, async (req, res) => {
  try {
    const records = await Borrow.find({ userId: req.user._id })
      .populate("bookId")
      .sort({ borrowedAt: -1 });

    // populate() yields null once a book has been bought with points and
    // deleted, so fall back to the snapshot taken when the loan was made. The
    // shape stays the same either way, and `bookGone` lets the UI drop the link.
    const withFallback = records.map((r) => {
      const doc = r.toObject();
      if (!doc.bookId && doc.bookSnapshot) {
        doc.bookId = {
          _id: null,
          title: doc.bookSnapshot.title,
          author: doc.bookSnapshot.author,
          coverImage: doc.bookSnapshot.coverImage,
        };
        doc.bookGone = true;
      }
      return doc;
    });

    res.json(withFallback);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your borrowed books", error: err.message });
  }
});

module.exports = router;
