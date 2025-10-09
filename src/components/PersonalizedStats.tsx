"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  CheckSquare, 
  FolderOpen, 
  Bell, 
  Award,
  AlertTriangle,
  Calendar,
  BarChart3,
  Zap
} from "lucide-react"
import { motion } from "@/components/motion"
import { api } from "@/lib/api"

interface DashboardStats {
  projects: {
    total: number
    active: number
    completed: number
    onHold: number
    owned: number
    member: number
  }
  tasks: {
    total: number
    todo: number
    inProgress: number
    done: number
    assigned: number
    created: number
    highPriority: number
    overdue: number
    dueToday: number
    dueThisWeek: number
  }
  activity: {
    thisWeek: number
    total: number
  }
  notifications: {
    unread: number
    total: number
  }
  productivity: {
    completionRate: number
    averageProjectProgress: number
  }
}

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  gradient: string
  delay: number
  badge?: {
    text: string
    variant: "default" | "secondary" | "destructive" | "outline"
  }
}

function StatsCard({ title, value, subtitle, icon, gradient, delay, badge }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${gradient}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {badge && (
              <Badge variant={badge.variant} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-1">{value}</div>
          {subtitle && (
            <p className="text-xs font-medium opacity-80">
              {subtitle}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function PersonalizedStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api<DashboardStats>("/api/dashboard/stats")
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load dashboard statistics</p>
      </div>
    )
  }

  const statsCards = [
    {
      title: "Active Tasks",
      value: stats.tasks.todo + stats.tasks.inProgress,
      subtitle: `${stats.tasks.done} completed`,
      icon: <CheckSquare className="h-5 w-5 text-green-600" />,
      gradient: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 text-green-700 dark:text-green-300",
      delay: 0.1,
      badge: stats.tasks.overdue > 0 ? { text: `${stats.tasks.overdue} overdue`, variant: "destructive" as const } : undefined
    },
    {
      title: "My Projects", 
      value: stats.projects.active,
      subtitle: `${stats.projects.completed} completed`,
      icon: <FolderOpen className="h-5 w-5 text-blue-600" />,
      gradient: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 text-blue-700 dark:text-blue-300",
      delay: 0.2
    },
    {
      title: "Due Today",
      value: stats.tasks.dueToday,
      subtitle: `${stats.tasks.dueThisWeek} this week`,
      icon: <Calendar className="h-5 w-5 text-purple-600" />,
      gradient: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 text-purple-700 dark:text-purple-300",
      delay: 0.3,
      badge: stats.tasks.dueToday > 0 ? { text: "urgent", variant: "default" as const } : undefined
    },
    {
      title: "Notifications",
      value: stats.notifications.unread,
      subtitle: "unread messages",
      icon: <Bell className="h-5 w-5 text-orange-600" />,
      gradient: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50 text-orange-700 dark:text-orange-300",
      delay: 0.4
    },
    {
      title: "Completion Rate",
      value: `${stats.productivity.completionRate}%`,
      subtitle: "task completion",
      icon: <Award className="h-5 w-5 text-emerald-600" />,
      gradient: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 text-emerald-700 dark:text-emerald-300",
      delay: 0.5,
      badge: stats.productivity.completionRate >= 80 ? { text: "excellent", variant: "default" as const } : 
             stats.productivity.completionRate >= 60 ? { text: "good", variant: "secondary" as const } : undefined
    },
    {
      title: "High Priority",
      value: stats.tasks.highPriority,
      subtitle: "urgent tasks",
      icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
      gradient: "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 text-red-700 dark:text-red-300",
      delay: 0.6,
      badge: stats.tasks.highPriority > 0 ? { text: "needs attention", variant: "destructive" as const } : undefined
    },
    {
      title: "Weekly Activity",
      value: stats.activity.thisWeek,
      subtitle: "actions this week",
      icon: <BarChart3 className="h-5 w-5 text-indigo-600" />,
      gradient: "bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950/50 dark:to-cyan-950/50 text-indigo-700 dark:text-indigo-300",
      delay: 0.7
    },
    {
      title: "Productivity",
      value: `${stats.productivity.averageProjectProgress}%`,
      subtitle: "avg. project progress",
      icon: <Zap className="h-5 w-5 text-yellow-600" />,
      gradient: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 text-yellow-700 dark:text-yellow-300",
      delay: 0.8
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((card, index) => (
        <StatsCard key={index} {...card} />
      ))}
    </div>
  )
}