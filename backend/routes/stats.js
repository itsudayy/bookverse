const express = require("express");
const Book = require("../models/Book");
const { db, COLLECTIONS } = require("../lib/firestore");

const router = express.Router();

// GET /api/stats
router.get("/", async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ available: true });
    const borrowedBooks = totalBooks - availableBooks;
    const categories = (await Book.distinct("category")).length;

    // Sold copies are deleted from the collection, so the only remaining record
    // of them is the purchases ledger.
    const purchasedSnap = await db.collection(COLLECTIONS.purchases).count().get();
    const purchasedBooks = purchasedSnap.data().count;

    res.json({ totalBooks, availableBooks, borrowedBooks, purchasedBooks, categories });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

module.exports = router;
