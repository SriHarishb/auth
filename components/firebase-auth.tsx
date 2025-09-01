"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { getClientAuthSafe } from "@/lib/firebase-client"

export default function FirebaseAuthUI() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const signInWithGoogle = async () => {
    setIsLoading(true)
    setError("")

    try {
      const auth = await getClientAuthSafe()
      if (!auth) {
        setError("Authentication not initialized")
        return
      }

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

  return { signInWithGoogle, isLoading, error }
}
