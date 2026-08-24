const express = require("express");
const {
  listStoreBooks,
  getStoreBook,
  listCategories,
} = require("../controllers/storeController");

const router = express.Router();

// Browsing the Store is public; only the cart and checkout need a signed-in user.
router.get("/categories", listCategories);
router.get("/books", listStoreBooks);
router.get("/books/:id", getStoreBook);

module.exports = router;
