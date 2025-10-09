"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  CheckSquare, 
  FolderOpen, 
  TrendingUp, 
  Clock, 
  Users, 
  MessageSquare,
  GitCommit,
  User,
  Globe,
  RefreshCw
} from "lucide-react"
import { motion } from "@/components/motion"
import { api } from "@/lib/api"
import Image from "next/image"

interface ActivityItem {
  id: string
  type: string
  message: string
  time: string
  user: { id: string; name: string; avatar?: string }
  projectId?: string
  taskId?: string
  metadata?: any
}

interface ActivityFeedProps {
  className?: string
}

function ActivityIcon({ type }: { type: string }) {
  if (type.includes("task")) {
    return <CheckSquare className="h-4 w-4 text-green-600" />
  }
  if (type.includes("project")) {
    return <FolderOpen className="h-4 w-4 text-blue-600" />
  }
  if (type.includes("comment")) {
    return <MessageSquare className="h-4 w-4 text-purple-600" />
  }
  if (type.includes("auth")) {
    return <User className="h-4 w-4 text-indigo-600" />
  }
  return <GitCommit className="h-4 w-4 text-gray-600" />
}

function ActivityBadge({ type }: { type: string }) {
  const badges = {
    task_created: { text: "Created", variant: "default" as const },
    task_completed: { text: "Completed", variant: "default" as const },
    task_updated: { text: "Updated", variant: "secondary" as const },
    project_created: { text: "New Project", variant: "default" as const },
    project_updated: { text: "Updated", variant: "secondary" as const },
    project_completed: { text: "Completed", variant: "default" as const },
    auth_login: { text: "Login", variant: "outline" as const },
    auth_register: { text: "Joined", variant: "default" as const },
  }
  
  const badge = badges[type as keyof typeof badges]
  if (!badge) return null
  
  return <Badge variant={badge.variant} className="text-xs">{badge.text}</Badge>
}

function getRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return "just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export function PersonalizedActivityFeed({ className = "" }: ActivityFeedProps) {
  const { user } = useUser()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  const fetchActivities = async (personal = false, refresh = false) => {
    try {
      if (refresh) setRefreshing(true)
      const params = new URLSearchParams({
        limit: "20",
        personal: personal.toString()
      })
      const data = await api<ActivityItem[]>(`/api/activity?${params}`)
      setActivities(data)
    } catch (error) {
      console.error("Failed to fetch activities:", error)
      setActivities([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchActivities(activeTab === "personal")
    
    // Auto-refresh every 15 seconds for real-time updates
    const interval = setInterval(() => {
      fetchActivities(activeTab === "personal")
    }, 15000)
    
    return () => clearInterval(interval)
  }, [activeTab])

  const handleRefresh = () => {
    fetchActivities(activeTab === "personal", true)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setLoading(true)
  }

  if (loading) {
    return (
      <Card className={`border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50 ${className}`}>
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50 ${className}`}>
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            Recent Activity
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              All Activity
            </TabsTrigger>
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Activity
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-3">
          {activities.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-border/50"
            >
              <div className="flex-shrink-0 mt-1">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-primary/20">
                  <ActivityIcon type={item.type} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed">
                    {item.message}
                  </p>
                  <ActivityBadge type={item.type} />
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    {item.user.avatar ? (
                      <Image 
                        src={item.user.avatar} 
                        alt={item.user.name}
                        width={16}
                        height={16}
                        className="h-4 w-4 rounded-full"
                      />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-2.5 w-2.5" />
                      </div>
                    )}
                    <span className="font-medium">
                      {item.user.id === user?.id ? 'You' : item.user.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground/50">•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <time title={new Date(item.time).toLocaleString()}>
                      {getRelativeTime(item.time)}
                    </time>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {activities.length === 0 && (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted/30 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No recent activity</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                {activeTab === "personal" 
                  ? "Start creating tasks or projects to see your activity here."
                  : "Start collaborating with your team to see activity here."
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}