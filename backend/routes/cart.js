const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyFirebaseToken);

router.get("/", getCart);
router.post("/", addToCart);
router.delete("/", clearCart);
router.patch("/:bookId", updateCartItem);
router.delete("/:bookId", removeFromCart);

module.exports = router;
