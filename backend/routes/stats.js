const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// GET /api/stats
router.get("/", async (req, res) => {
  try {
    // Purchased copies have left the library, so they're counted separately
    // rather than inflating the collection totals.
    const inCollection = { purchased: { $ne: true } };

    const totalBooks = await Book.countDocuments(inCollection);
    const availableBooks = await Book.countDocuments({ ...inCollection, available: true });
    const borrowedBooks = totalBooks - availableBooks;
    const purchasedBooks = await Book.countDocuments({ purchased: true });
    const categories = (await Book.distinct("category", inCollection)).length;

    res.json({ totalBooks, availableBooks, borrowedBooks, purchasedBooks, categories });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

module.exports = router;
