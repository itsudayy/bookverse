const admin = require("../lib/firebaseAdmin");
const User = require("../models/User");

// Called right after any successful Firebase sign-in. The Firebase UID is read
// from the verified token, never from the request body — otherwise the client
// could claim to be any user it liked.
async function syncUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Missing authorization token" });

    const decoded = await admin.auth().verifyIdToken(token);
    const { name } = req.body;

    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      user = await User.create({
        firebaseUid: decoded.uid,
        email: decoded.email,
        name: name || decoded.name || decoded.email.split("@")[0],
      });
    } else if (name && name !== user.name) {
      // The signup form's explicit call and the auth-state-change listener's
      // call can race (the listener fires before updateProfile() finishes
      // setting displayName). Treat an explicitly provided name as authoritative
      // whenever it arrives, instead of only setting it at creation time.
      user.name = name;
      await user.save();
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res) {
  res.json(req.user);
}

module.exports = { syncUser, getMe };
