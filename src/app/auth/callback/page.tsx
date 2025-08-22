"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loading } from "@/components/Loading"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home after a short delay
    const timer = setTimeout(() => {
      router.push("/")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loading size="lg" />
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  )
}
