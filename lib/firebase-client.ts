import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCRFmM4Tr-lMDp0ZaktN3OnZV3z4G4-zAw",
  authDomain: "fir-3b2fa.firebaseapp.com",
  projectId: "fir-3b2fa",
  storageBucket: "fir-3b2fa.firebasestorage.app",
  messagingSenderId: "313227259174",
  appId: "1:313227259174:web:d27b14c7414c4b325565e7",
  measurementId: "G-XTVVZD55FJ",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let cachedAuth: Auth | null = null;

// Safe getter: never throws on server; initializes once in the browser
export function getClientAuthSafe(): Auth | null {
  if (typeof window === "undefined") return null;
  if (cachedAuth) return cachedAuth;

  try {
    cachedAuth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver, // harmless even if using popup only
    });
    console.log("[Firebase] Auth initialized (browser, custom persistence + resolver)");
  } catch {
    cachedAuth = getAuth(app);
    console.log("[Firebase] Using existing Auth instance");
  }
  return cachedAuth;
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
