"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getClientAuthSafe } from "@/lib/firebase-client"
import { onAuthStateChanged } from "firebase/auth"

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const auth = getClientAuthSafe()
    if (!auth) {
      router.push('/auth')
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth')
      }
    })

    return () => unsubscribe()
  }, [router])

  return children
}
