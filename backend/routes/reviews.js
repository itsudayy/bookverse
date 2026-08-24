const express = require("express");
const { listReviews, addReview, listMyReviews } = require("../controllers/reviewController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

// Declared before the "/:source/:bookId" param route so "mine" isn't captured
// as a source.
router.get("/mine", verifyFirebaseToken, listMyReviews);
router.get("/:source/:bookId", listReviews);
router.post("/:source/:bookId", verifyFirebaseToken, addReview);

module.exports = router;
