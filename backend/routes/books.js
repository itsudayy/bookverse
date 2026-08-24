const express = require("express");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const { verifyFirebaseToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// GET /api/books - search, filter, sort
router.get("/", async (req, res) => {
  try {
    const { search, author, category, sort, includePurchased } = req.query;

    // A purchased copy belongs to its buyer and is no longer part of the
    // library's collection. Admin passes includePurchased so sold titles don't
    // silently vanish from the management table.
    const query = includePurchased === "true" ? {} : { purchased: { $ne: true } };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }
    if (author) {
      query.author = { $regex: author, $options: "i" };
    }
    if (category && category !== "All") {
      query.category = category;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    else if (sort === "az") sortOption = { title: 1 };
    else if (sort === "rating") sortOption = { rating: -1 };
    else if (sort === "newest") sortOption = { createdAt: -1 };

    const books = await Book.find(query).sort(sortOption);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch books", error: err.message });
  }
});

// GET /api/books/:id
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch book", error: err.message });
  }
});

// POST /api/books — official collection is the library authority's, admin only
router.post("/", verifyFirebaseToken, requireRole("admin"), async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: "Failed to create book", error: err.message });
  }
});

// PUT /api/books/:id — admin only
router.put("/:id", verifyFirebaseToken, requireRole("admin"), async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Failed to update book", error: err.message });
  }
});

// DELETE /api/books/:id — admin only
router.delete("/:id", verifyFirebaseToken, requireRole("admin"), async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete book", error: err.message });
  }
});

// POST /api/books/:id/borrow
router.post("/:id/borrow", verifyFirebaseToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    if (book.purchased) {
      return res
        .status(400)
        .json({ message: "This copy has been purchased and is no longer available to borrow" });
    }
    if (!book.available) {
      return res.status(400).json({ message: "This book is currently unavailable" });
    }

    const name = (req.body.shippingName || "").trim();
    const phone = (req.body.shippingPhone || "").trim();
    const address = (req.body.shippingAddress || "").trim();
    if (!name || !phone || !address) {
      return res
        .status(400)
        .json({ message: "Name, phone number and home address are required to borrow" });
    }

    const alreadyBorrowed = await Borrow.findOne({
      userId: req.user._id,
      bookId: book._id,
      status: "borrowed",
    });
    if (alreadyBorrowed) {
      return res.status(400).json({ message: "You have already borrowed this book" });
    }

    const borrow = await Borrow.create({
      userId: req.user._id,
      bookId: book._id,
      shipping: { name, phone, address },
    });
    book.available = false;
    await book.save();

    res.status(201).json(borrow);
  } catch (err) {
    res.status(500).json({ message: "Failed to borrow book", error: err.message });
  }
});

// POST /api/books/:id/return
router.post("/:id/return", verifyFirebaseToken, async (req, res) => {
  try {
    const borrow = await Borrow.findOne({
      bookId: req.params.id,
      userId: req.user._id,
      status: "borrowed",
    });
    if (!borrow) {
      return res.status(404).json({ message: "No active borrow record found for you on this book" });
    }

    borrow.status = "returned";
    borrow.returnedAt = new Date();
    await borrow.save();

    await Book.findByIdAndUpdate(req.params.id, { available: true });

    res.json(borrow);
  } catch (err) {
    res.status(500).json({ message: "Failed to return book", error: err.message });
  }
});

module.exports = router;
