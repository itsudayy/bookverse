const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  author: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  publishedYear: { type: Number, required: true },
  pages: { type: Number, required: true },
  coverImage: { type: String, required: true },
  rating: { type: Number, default: 4, min: 0, max: 5 },

  // A borrowed book is still the library's — it comes back. A book bought with
  // points does not, so it is deleted outright rather than flagged; the only
  // trace left is the buyer's purchase record. Anything that needs to survive
  // that delete (borrow history, reviews) keeps its own snapshot of the book.
  available: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Book", bookSchema);
