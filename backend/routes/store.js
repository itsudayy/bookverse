const express = require("express");
const {
  listStoreBooks,
  getStoreBook,
  listCategories,
  createStoreBook,
  updateStoreBook,
  deleteStoreBook,
} = require("../controllers/storeController");
const { verifyFirebaseToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Browsing the Store is public; only writing to it needs an admin.
router.get("/categories", listCategories);
router.get("/books", listStoreBooks);
router.get("/books/:id", getStoreBook);

router.post("/books", verifyFirebaseToken, requireRole("admin"), createStoreBook);
router.put("/books/:id", verifyFirebaseToken, requireRole("admin"), updateStoreBook);
router.delete("/books/:id", verifyFirebaseToken, requireRole("admin"), deleteStoreBook);

module.exports = router;
