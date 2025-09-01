"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { getClientAuthSafe } from "@/lib/firebase-client"
import { onAuthStateChanged, type User } from "firebase/auth"

export default function WelcomePage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = getClientAuthSafe()
    if (!auth) {
      router.push('/auth')
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        router.push('/auth')
      }
    })

    return () => unsubscribe()
  }, [router])

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
          <p className="text-lg">
            You have successfully signed in.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
