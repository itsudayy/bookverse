const express = require("express");
const { listReviews, addReview } = require("../controllers/reviewController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

router.get("/:source/:bookId", listReviews);
router.post("/:source/:bookId", verifyFirebaseToken, addReview);

module.exports = router;
