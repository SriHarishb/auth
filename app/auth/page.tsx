"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getClientAuthSafe } from "@/lib/firebase-client"
import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const signInWithGoogle = async () => {
    setIsLoading(true)
    setError("")

    try {
      console.log("Starting Google Sign In...")
      const auth = getClientAuthSafe()
      if (!auth) {
        throw new Error("Auth not initialized. Check Firebase configuration.")
      }

      console.log("Auth initialized, proceeding with sign in...")
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        prompt: 'select_account'
      })

      const result = await signInWithPopup(auth, provider)
      console.log("Sign in successful, user ID:", result.user.uid)
      setUser(result.user)
      
      // Wait longer to ensure Firestore sync completes
      console.log("Waiting for Firestore sync...")
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Redirecting to welcome page...")
      router.push('/welcome')
    } catch (error: any) {
      console.error("Detailed auth error:", {
        code: error.code,
        message: error.message,
        credential: error.credential,
        email: error.email,
        phoneNumber: error.phoneNumber
      })
      
      let errorMessage = "Failed to sign in with Google"
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Sign-in popup was closed. Please try again."
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Sign-in popup was blocked. Please allow popups for this site."
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Firebase Authentication. Please check your Firebase configuration."
      }
      
      setError(errorMessage)
      setIsLoading(false)
    } finally {
      if (isLoading) setIsLoading(false)
    }
  }

  const [error, setError] = useState<string>("")

  useEffect(() => {
    // Check if auth is initialized
    const auth = getClientAuthSafe()
    if (!auth) {
      setError("Authentication not initialized")
    }
  }, [])

  const goBack = () => {
    router.push("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{isLoading ? "Signing you in..." : "Sign in to your account"}</CardTitle>
          <CardDescription>
            {isLoading 
              ? "Please wait while we authenticate with Google" 
              : error 
                ? error 
                : "Choose your sign in method below"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                onClick={signInWithGoogle} 
                variant="outline" 
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border-gray-300"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
              <Button onClick={goBack} variant="outline" className="w-full bg-transparent">
                Back to Home
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
function initializeFirebaseAuth() {
  const auth = getClientAuthSafe()
  if (!auth) return

  // Optionally, listen for auth state changes and set user if needed
  // Example:
  // import { onAuthStateChanged } from "firebase/auth"
  // onAuthStateChanged(auth, (user) => {
  //   setUser(user)
  // })
}

