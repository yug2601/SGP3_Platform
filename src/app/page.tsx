"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { motion } from "@/components/motion"
import { Skeleton } from "@/components/ui/skeleton"
import { PersonalizedWelcomeBanner } from "@/components/PersonalizedWelcomeBanner"
import { PersonalizedStats } from "@/components/PersonalizedStats"
import { PersonalizedActivityFeed } from "@/components/PersonalizedActivityFeed"
// ActivityLogger will be imported dynamically when needed

export default function Home() {
  const { user, isLoaded } = useUser()
  const [dashboardReady, setDashboardReady] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      // Log user visit for activity tracking (client-side API call)
      fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'auth_login',
          message: 'Signed in to TogetherFlow',
          metadata: { timestamp: new Date().toISOString() }
        })
      }).catch(console.error)
      
      setDashboardReady(true)
    }
  }, [isLoaded, user])

  if (!isLoaded) {
    return <DashboardSkeleton />
  }

  if (!dashboardReady) {
    return <DashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Personalized Welcome Banner */}
        <PersonalizedWelcomeBanner />

        {/* Comprehensive Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PersonalizedStats />
        </motion.div>

        {/* Real-time Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PersonalizedActivityFeed />
        </motion.div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  )
}
