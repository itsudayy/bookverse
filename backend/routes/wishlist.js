const express = require("express");
const {
  listWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

router.get("/", verifyFirebaseToken, listWishlist);
router.post("/", verifyFirebaseToken, addToWishlist);
router.delete("/:source/:bookId", verifyFirebaseToken, removeFromWishlist);

module.exports = router;
