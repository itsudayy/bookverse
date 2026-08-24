const MESSAGES = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network problem — check your connection and try again.",

  // Google sign-in specific
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/cancelled-popup-request": "Google sign-in was cancelled.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in popup. Allow popups for this site, or try again to continue in the same tab.",
  "auth/unauthorized-domain": "This site isn't authorized for Google sign-in yet.",
  "auth/operation-not-allowed": "Google sign-in isn't enabled for this project.",
  "auth/account-exists-with-different-credential":
    "You already have an account with this email. Log in with your email and password instead.",
};

export function friendlyAuthError(err) {
  const known = MESSAGES[err?.code];
  if (known) return known;
  // Surface the raw code for anything unmapped — a bare "something went wrong"
  // makes real sign-in failures impossible to diagnose from a screenshot.
  return err?.code
    ? `Something went wrong (${err.code}). Please try again.`
    : "Something went wrong. Please try again.";
}
