const express = require("express");
const Borrow = require("../models/Borrow");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/borrowed/me
router.get("/me", auth, async (req, res) => {
  try {
    const records = await Borrow.find({ userId: req.userId })
      .populate("bookId")
      .sort({ borrowedAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your borrowed books", error: err.message });
  }
});

module.exports = router;
