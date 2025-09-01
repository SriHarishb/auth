import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  onAuthStateChanged,
  type Auth,
  type User,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  type Firestore 
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCRFmM4Tr-lMDp0ZaktN3OnZV3z4G4-zAw",
  authDomain: "fir-3b2fa.firebaseapp.com",
  projectId: "fir-3b2fa",
  storageBucket: "fir-3b2fa.firebasestorage.app",
  messagingSenderId: "313227259174",
  appId: "1:313227259174:web:d27b14c7414c4b325565e7",
  measurementId: "G-XTVVZD55FJ",
};

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

let cachedAuth: Auth | null = null;

// Safe getter: never throws on server; initializes once in the browser
export function getClientAuthSafe(): Auth | null {
  if (typeof window === "undefined") return null;
  if (cachedAuth) return cachedAuth;

  try {
    cachedAuth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
    console.log("[Firebase] Auth initialized (browser, custom persistence + resolver)");
  } catch {
    cachedAuth = getAuth(app);
    console.log("[Firebase] Using existing Auth instance");
  }

  // Set up auth state listener to sync user data with Firestore
  onAuthStateChanged(cachedAuth, async (user) => {
    if (user) {
      await syncUserData(user);
    }
  });

  return cachedAuth;
}

// Sync user data with Firestore
async function syncUserData(user: User) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document if it doesn't exist
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
    } else {
      // Update last login time
      await setDoc(userRef, {
        lastLogin: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error syncing user data:', error);
  }
}

// Guard Analytics for Next.js environments
export const analytics =
  typeof window !== "undefined"
    ? (() => {
        try {
          const a = getAnalytics(app);
          console.log("[Firebase] Analytics initialized");
          return a;
        } catch (e) {
          console.warn("[Firebase] Analytics skipped in this context", e);
          return null;
        }
      })()
    : null;
