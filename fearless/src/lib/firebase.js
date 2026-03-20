import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlSr3gqK9VK3eqk5dqdy8b8-X1Vp9ICYs",
  authDomain: "fearless-75749.firebaseapp.com",
  projectId: "fearless-75749",
  storageBucket: "fearless-75749.firebasestorage.app",
  messagingSenderId: "1095284157161",
  appId: "1:1095284157161:web:cfe3fb361002ab4f3d1e78"
};

// Initialize Firebase (prevent double init in dev mode)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
