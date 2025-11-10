"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { motion } from "@/components/motion"
import { 
  Zap, 
  Target, 
  Award, 
  TrendingUp,
  Calendar,
  CheckSquare2,
  Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

interface WelcomeBannerProps {
  className?: string
}

interface QuickStats {
  dueToday: number
  activeProjects: number
  completedTasks: number
  completionRate: number
}

function getGreeting(): string {
  // Get current time in IST (Indian Standard Time)
  const now = new Date()
  const istTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}))
  const hour = istTime.getHours()
  
  if (hour >= 4 && hour < 12) return "Good Morning"
  if (hour >= 12 && hour < 16) return "Good Afternoon"  
  if (hour >= 16 && hour < 20) return "Good Evening"
  return "Good Night"
}

function getMotivationalMessage(stats: QuickStats): string {
  if (stats.dueToday > 0) {
    return `You have ${stats.dueToday} task${stats.dueToday > 1 ? 's' : ''} due today. Let's tackle them!`
  }
  if (stats.completionRate >= 80) {
    return "You're crushing it! Keep up the excellent work! 🚀"
  }
  if (stats.activeProjects > 0) {
    return "Ready to make progress on your projects? Let's go!"
  }
  return "Ready to boost your productivity today?"
}

export function PersonalizedWelcomeBanner({ className = "" }: WelcomeBannerProps) {
  const { user, isLoaded } = useUser()
  const [stats, setStats] = useState<QuickStats>({ dueToday: 0, activeProjects: 0, completedTasks: 0, completionRate: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api<any>("/api/dashboard/stats")
        setStats({
          dueToday: data.tasks.dueToday,
          activeProjects: data.projects.active,
          completedTasks: data.tasks.done,
          completionRate: data.productivity.completionRate
        })
      } catch (error) {
        console.error("Failed to fetch welcome stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded && user) {
      fetchStats()
    }
  }, [isLoaded, user])

  if (!isLoaded || loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 dark:from-teal-600 dark:via-emerald-600 dark:to-green-700 p-8 text-white shadow-xl dark:shadow-2xl ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-white/20 dark:bg-white/30 rounded mb-4"></div>
          <div className="h-4 w-48 bg-white/20 dark:bg-white/30 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/10 dark:bg-white/15 rounded-xl p-4 h-24"></div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  const displayName = user?.firstName || 
                     user?.username || 
                     user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 
                     "User"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 dark:from-teal-600 dark:via-emerald-600 dark:to-green-700 p-8 text-white shadow-xl dark:shadow-2xl ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-black/10 dark:bg-black/20"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 dark:bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 dark:bg-white/5 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-white/20 dark:bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/30 dark:border-white/40">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1 text-white">
                {getGreeting()}, {displayName}! 👋
              </h1>
              <p className="text-teal-100 dark:text-teal-200 text-lg font-medium">
                {getMotivationalMessage(stats)}
              </p>
            </div>
          </div>
          
          {/* Achievement badges */}
          <div className="hidden md:flex flex-col gap-2">
            {stats.completionRate >= 90 && (
              <Badge className="bg-white/20 dark:bg-white/30 text-white border-white/30 dark:border-white/40 hover:bg-white/30 dark:hover:bg-white/40">
                <Award className="h-3 w-3 mr-1" />
                High Achiever
              </Badge>
            )}
            {stats.dueToday === 0 && stats.completedTasks > 0 && (
              <Badge className="bg-white/20 dark:bg-white/30 text-white border-white/30 dark:border-white/40 hover:bg-white/30 dark:hover:bg-white/40">
                <Target className="h-3 w-3 mr-1" />
                On Track
              </Badge>
            )}
          </div>
        </div>

        {/* Quick stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-white/30 hover:bg-white/15 dark:hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-white">Today's Focus</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.dueToday}</p>
            <p className="text-xs text-teal-100 dark:text-teal-200">
              {stats.dueToday === 0 ? "All caught up!" : `task${stats.dueToday > 1 ? 's' : ''} due today`}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-white/30 hover:bg-white/15 dark:hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-white">Active Projects</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
            <p className="text-xs text-teal-100 dark:text-teal-200">
              {stats.activeProjects === 0 ? "Start a new project" : "in progress"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/10 dark:bg-white/15 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-white/30 hover:bg-white/15 dark:hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-white">Success Rate</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.completionRate}%</p>
            <p className="text-xs text-teal-100 dark:text-teal-200">
              task completion rate
            </p>
          </motion.div>
        </div>

        {/* Quick action hints */}
        <div className="mt-6 flex items-center gap-4 text-sm text-teal-100 dark:text-teal-200">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          {stats.dueToday > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CheckSquare2 className="h-4 w-4" />
                <span>Focus on today's tasks first</span>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}