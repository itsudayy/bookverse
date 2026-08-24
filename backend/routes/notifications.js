const express = require("express");
const { db, COLLECTIONS } = require("../lib/firestore");
const { verifyFirebaseToken } = require("../middleware/auth");

const router = express.Router();

// The bell reads notifications live from Firestore on the client; these routes
// exist for the writes, which clients are not permitted to make directly.
router.post("/:id/read", verifyFirebaseToken, async (req, res, next) => {
  try {
    const ref = db.collection(COLLECTIONS.notifications).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: "Notification not found" });
    if (doc.data().userUid !== req.user.firebaseUid) {
      return res.status(403).json({ message: "Not your notification" });
    }
    await ref.update({ read: true });
    res.json({ message: "Marked read" });
  } catch (err) {
    next(err);
  }
});

router.post("/read-all", verifyFirebaseToken, async (req, res, next) => {
  try {
    const snap = await db
      .collection(COLLECTIONS.notifications)
      .where("userUid", "==", req.user.firebaseUid)
      .where("read", "==", false)
      .get();

    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();

    res.json({ message: "All marked read", count: snap.size });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
