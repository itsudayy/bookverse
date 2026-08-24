import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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
    // Sign-in happens via popup (see loginWithGoogle), so there is normally no
    // redirect to finish. This only settles a redirect left pending by an older
    // build, and surfaces its error instead of letting it vanish silently.
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

  // Popup only, deliberately. signInWithRedirect completes its handshake through
  // a cross-origin iframe on the Firebase auth domain, and Chrome 115+,
  // Firefox 109+ and Safari 16.1+ all block that third-party storage — the user
  // signs in at Google, returns, and is silently not logged in. Falling back to
  // it therefore strands people on the login page instead of rescuing them, so
  // a blocked popup is reported as an error the user can act on.
  // See https://firebase.google.com/docs/auth/web/redirect-best-practices
  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
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
