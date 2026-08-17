const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// GET /api/stats
router.get("/", async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ available: true });
    const borrowedBooks = totalBooks - availableBooks;
    const categories = (await Book.distinct("category")).length;

    res.json({ totalBooks, availableBooks, borrowedBooks, categories });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

module.exports = router;
