const express = require("express");
const { syncUser, getMe, bootstrapAdmin } = require("../controllers/authController");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

router.post("/sync", syncUser);
router.get("/me", verifyFirebaseToken, getMe);
router.post("/bootstrap-admin", verifyFirebaseToken, bootstrapAdmin);

module.exports = router;
