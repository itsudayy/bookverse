const express = require("express");
const { syncUser, getMe } = require("../controllers/authController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

router.post("/sync", syncUser);
router.get("/me", verifyFirebaseToken, getMe);

module.exports = router;
