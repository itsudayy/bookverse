const express = require("express");
const {
  listUsedBooks,
  getUsedBook,
  addUsedBook,
  deleteUsedBook,
  listMyUsedBooks,
  requestBorrow,
  listRequests,
  respondToRequest,
  returnUsedBook,
} = require("../controllers/communityController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

// "mine" is declared before "/books/:id" so it isn't swallowed as an id.
router.get("/books/mine", verifyFirebaseToken, listMyUsedBooks);
router.get("/books", listUsedBooks);
router.get("/books/:id", getUsedBook);
router.post("/books", verifyFirebaseToken, addUsedBook);
router.delete("/books/:id", verifyFirebaseToken, deleteUsedBook);

router.post("/books/:id/request", verifyFirebaseToken, requestBorrow);
router.get("/requests", verifyFirebaseToken, listRequests);
router.post("/requests/:id/respond", verifyFirebaseToken, respondToRequest);
router.post("/requests/:id/return", verifyFirebaseToken, returnUsedBook);

module.exports = router;
