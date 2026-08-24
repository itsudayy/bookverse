import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirectError, setRedirectError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    // Completes a redirect-based Google sign-in when the user lands back here.
    // onAuthStateChanged picks the session up either way; this call exists so a
    // failed redirect surfaces in the UI instead of vanishing silently.
    getRedirectResult(auth).catch((err) => {
      console.error("Google redirect sign-in failed", err);
      setRedirectError(err);
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const { data } = await api.post("/auth/sync", { name: fbUser.displayName });
          setProfile(data);
        } catch (err) {
          console.error("Failed to sync user profile", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signup(name, email, password) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    const { data } = await api.post("/auth/sync", { name });
    setProfile(data);
    return cred.user;
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  }

  // signInWithPopup depends on a cross-origin handshake with the Firebase auth
  // handler, which browsers break in several ways we can't control: popup
  // blockers, embedded webviews, and third-party-storage partitioning. When it
  // fails for an environmental reason (rather than the user cancelling), fall
  // back to a full-page redirect, which needs neither a popup nor third-party
  // storage. getRedirectResult() below finishes that flow on the way back.
  const POPUP_ENV_FAILURES = new Set([
    "auth/popup-blocked",
    "auth/operation-not-supported-in-this-environment",
    "auth/web-storage-unsupported",
    "auth/internal-error",
  ]);

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      return cred.user;
    } catch (err) {
      if (!POPUP_ENV_FAILURES.has(err?.code)) throw err;
      await signInWithRedirect(auth, provider);
      return null; // page navigates to Google; nothing to return here
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function refreshProfile() {
    if (!auth?.currentUser) return;
    const { data } = await api.get("/auth/me");
    setProfile(data);
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        redirectError,
        signup,
        login,
        loginWithGoogle,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
