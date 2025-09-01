"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { GoogleAuthProvider, signInWithPopup, User, onAuthStateChanged } from "firebase/auth"
import { getAuth } from "firebase/auth"
import { getClientAuthSafe } from "@/lib/firebase-client"

interface FirebaseAuthHook {
  signInWithGoogle: () => Promise<void>
  isLoading: boolean
  error: string
  user: User | null
}

export function useFirebaseAuth(): FirebaseAuthHook {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      const auth = await getClientAuthSafe();
      if (!auth) return;

      // Initialize auth state listener
      unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [])

  const signInWithGoogle = async () => {
    const auth = await getClientAuthSafe()
    if (!auth) {
      setError("Authentication not initialized")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })

      const result = await signInWithPopup(auth, provider)
      if (result.user) {
        router.replace('/welcome')
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-in was cancelled. Please try again.")
      } else if (error.code === 'auth/unauthorized-domain') {
        setError("This website is not authorized for sign-in. Please check configuration.")
      } else {
        setError("Failed to sign in. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { signInWithGoogle, isLoading, error, user }
}
