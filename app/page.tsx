// app/login/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getClientAuthSafe } from "@/lib/firebase-client";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  type Auth,
} from "firebase/auth";

// Helpers to avoid stale redirect state confusing the flow
function listPendingKeys(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return Object.keys(sessionStorage ?? {}).filter((k) =>
      k.includes("firebase:pendingRedirect")
    );
  } catch {
    return [];
  }
}
function clearPendingRedirectKeys() {
  if (typeof window === "undefined") return;
  try {
    const keys = listPendingKeys();
    for (const k of keys) sessionStorage.removeItem(k);
    console.log("[Auth] Cleared pending redirect keys:", keys);
  } catch (e) {
    console.warn("[Auth] Could not clear pending redirect keys:", e);
  }
}

export default function LoginRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const ran = useRef(false);
  const authRef = useRef<Auth | null>(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    console.log("[Auth] LoginRedirectPage mounted", {
      href: typeof window !== "undefined" ? window.location.href : "n/a",
      origin: typeof window !== "undefined" ? window.location.origin : "n/a",
    });

    const auth = getClientAuthSafe();
    authRef.current = auth;
    if (!auth) {
      console.warn("[Auth] Auth not available on SSR pass; will initialize after hydrate");
      return;
    }

    // 1) Navigate based on auth state (source of truth)
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ [Auth] User is signed in, navigating…", {
          uid: user.uid,
          email: user.email,
        });
        router.push(next);
      } else {
        console.log("ℹ️ [Auth] No user signed in (auth state)");
      }
    });

    // 2) Optional: inspect redirect result for debugging (not required to navigate)
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          console.log("✅ [Auth] getRedirectResult user:", {
            uid: res.user.uid,
            email: res.user.email,
          });
        } else {
          console.log("ℹ️ [Auth] No redirect result (normal on some reloads)");
        }
      })
      .catch((error) => {
        console.error("❌ [Auth] getRedirectResult error", {
          code: error?.code,
          message: error?.message,
        });
      });

    // 3) Kick off Google sign-in via redirect on page load
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      // Clean up any stale state before attempting a fresh redirect
      if (listPendingKeys().length) clearPendingRedirectKeys();

      console.log("[Auth] Triggering Google sign-in via redirect…");
      signInWithRedirect(auth, provider).catch((error) => {
        console.error("❌ [Auth] signInWithRedirect failed", {
          code: error?.code,
          message: error?.message,
        });
      });
    } catch (e) {
      console.error("❌ [Auth] Unexpected error starting redirect", e);
    }

    return () => unsub();
  }, [router, next]);

  // Minimal UX while redirecting
  return <div style={{ padding: 24 }}>Redirecting to Google sign-in…</div>;
}
