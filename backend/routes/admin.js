const express = require("express");
const { listMembers } = require("../controllers/adminController");
const { verifyFirebaseToken, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(verifyFirebaseToken, requireRole("admin"));

router.get("/members", listMembers);

module.exports = router;
