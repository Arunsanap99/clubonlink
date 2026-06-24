// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

// Firebase config from environment variables (Vite uses import.meta.env)
const firebaseConfig = {
apiKey: "AIzaSyBboYdQjWIOMAMltVsnm4MpgoNirHoX9mo",
  authDomain: "linkup-club.firebaseapp.com",
  projectId: "linkup-club",
  storageBucket: "linkup-club.firebasestorage.app",
  messagingSenderId: "923846551589",
  appId: "1:923846551589:web:1b0bcb3f14b9c0f2da37cc",
  measurementId: "G-S2Q0EV08CS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Functions
export const functions = getFunctions(app);

export default app;
