const express = require("express");
const {
  getMyPoints,
  listMyPurchases,
  purchaseOfficialBook,
} = require("../controllers/pointsController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

router.get("/me", verifyFirebaseToken, getMyPoints);
router.get("/purchases", verifyFirebaseToken, listMyPurchases);
router.post("/purchase/:bookId", verifyFirebaseToken, purchaseOfficialBook);

module.exports = router;
