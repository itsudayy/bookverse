const mongoose = require("mongoose");

const borrowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  borrowedAt: { type: Date, default: Date.now },
  returnedAt: { type: Date, default: null },
  status: { type: String, enum: ["borrowed", "returned"], default: "borrowed" },
  // Where the library parcels the book. Stored on the borrow record itself
  // rather than a new collection, so a delivery address is tied to the one
  // loan it was given for instead of lingering on the account.
  shipping: {
    name: String,
    phone: String,
    address: String,
  },

  // A copy of the book as it was when borrowed. If the title is later bought
  // with points the Book document is deleted, and without this the reader's
  // history would populate to null and render as "Untitled".
  bookSnapshot: {
    title: String,
    author: String,
    coverImage: String,
  },
});

module.exports = mongoose.model("Borrow", borrowSchema);
