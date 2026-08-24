const admin = require("./firebaseAdmin");

// Firestore is reached through the Admin SDK, so anything that awards points,
// creates community books, or resolves borrow requests runs server-side with
// the user identity taken from a verified ID token. Clients get read access
// (and real-time listeners) directly, but never write these documents — see
// firestore.rules.
const db = admin.firestore();

const COLLECTIONS = {
  users: "users",
  usedBooks: "usedBooks",
  borrowRequests: "borrowRequests",
  notifications: "notifications",
  reviews: "reviews",
  purchases: "purchases",
  wishlist: "wishlist",
  storeBooks: "storeBooks",
  carts: "carts",
  orders: "orders",
};

// A contributor earns this for each used book they share; an official book
// costs this many points to own permanently. Kept here so the economy has a
// single source of truth on the server.
const POINTS_PER_CONTRIBUTION = 50;
const POINTS_TO_PURCHASE = 200;

module.exports = { db, COLLECTIONS, POINTS_PER_CONTRIBUTION, POINTS_TO_PURCHASE };
