const express = require("express");
const {
  createCheckoutSession,
  confirmCheckout,
  listMyOrders,
} = require("../controllers/checkoutController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

router.use(verifyFirebaseToken);

router.post("/session", createCheckoutSession);
router.get("/confirm/:sessionId", confirmCheckout);
router.get("/orders", listMyOrders);

module.exports = router;
