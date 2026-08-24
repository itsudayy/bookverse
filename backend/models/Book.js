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
  available: { type: Boolean, default: true },

  // The library holds one copy of each title, so buying it with points takes it
  // out of circulation for good. Flagged rather than deleted: reviews, past
  // borrow records and the buyer's purchase all still point at this document,
  // and the buyer should still be able to open the book's page.
  purchased: { type: Boolean, default: false },
  purchasedBy: { type: String, default: null }, // firebaseUid of the owner
  purchasedAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Book", bookSchema);
