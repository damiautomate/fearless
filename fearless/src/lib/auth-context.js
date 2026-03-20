"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getUserProfile, createUserProfile } from "./firestore";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // Firebase auth user
  const [profile, setProfile] = useState(null);   // Firestore profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signup = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(cred.user.uid, { name, email });
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred.user;
  };

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const p = await getUserProfile(cred.user.uid);
    setProfile(p);
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    let p = await getUserProfile(cred.user.uid);
    if (!p) {
      await createUserProfile(cred.user.uid, {
        name: cred.user.displayName || "Friend",
        email: cred.user.email,
      });
      p = await getUserProfile(cred.user.uid);
    }
    setProfile(p);
    return cred.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signup, login, loginWithGoogle, logout, resetPassword, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
