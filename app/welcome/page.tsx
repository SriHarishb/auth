"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getClientAuthSafe } from "@/lib/firebase-client"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    getClientAuthSafe().then((auth) => {
      console.log("Welcome page mounted, checking auth state...");

      if (!auth) {
        console.log("No auth instance found, redirecting to login...");
        router.replace('/auth');
        setLoading(false);
        return;
      }

      unsubscribe = onAuthStateChanged(auth, (user) => {
        console.log("Auth state changed:", user ? "User logged in" : "No user");
        if (user) {
          setUser(user);
        } else {
          router.replace('/auth');
        }
        setLoading(false);
      });

      // Immediate check for current user
      if (auth.currentUser) {
        console.log("Current user found:", auth.currentUser.uid);
        setUser(auth.currentUser);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router])

  const handleSignOut = async () => {
    const auth = await getClientAuthSafe()
    if (auth) {
      try {
        await signOut(auth)
        router.replace('/auth')
      } catch (error) {
        console.error('Error signing out:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome!</CardTitle>
          <CardDescription>
            {user?.displayName ? `Hello, ${user.displayName}!` : 'Hello there!'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            {user?.photoURL && (
              <div className="flex justify-center">
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full"
                />
              </div>
            )}
            <p className="text-lg">
              You have successfully signed in.
            </p>
            {user?.email && (
              <p className="text-sm text-gray-500">
                {user.email}
              </p>
            )}
          </div>
          <Button 
            onClick={handleSignOut}
            variant="outline"
            className="mt-4"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
