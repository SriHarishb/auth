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
    let unsubscribe: (() => void) | undefined;

    getClientAuthSafe().then((auth) => {
      if (!auth) {
        router.push('/auth')
        return
      }

      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push('/auth')
        }
      })
    })

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [router])

  return children
}
