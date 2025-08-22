"use client"

import { useEffect, useMemo, useState, memo } from "react"
import { motion } from "@/components/motion"
import { 
  Bell, 
  CheckCircle, 
  Archive, 
  Filter, 
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressiveList } from "@/components/ProgressiveList"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Notification } from "@/lib/types"

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "comment":
      return <MessageCircle className="h-4 w-4 text-blue-500" />
    case "task_assigned":
      return <UserPlus className="h-4 w-4 text-green-500" />
    case "project_update":
      return <CheckCircle className="h-4 w-4 text-purple-500" />
    case "team_invite":
      return <UserPlus className="h-4 w-4 text-indigo-500" />
    case "deadline":
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    case "task_completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

const NotificationItem = memo(function NotificationItem({ notification, index, onMarkRead, onArchive }: {
  notification: Notification
  index: number
  onMarkRead: (id: string) => void
  onArchive: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "transition-all hover:shadow-md cursor-pointer",
          !notification.isRead && "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
        )}
        onClick={() => !notification.isRead && onMarkRead(notification.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className={cn(
                    "font-medium text-sm",
                    !notification.isRead && "font-semibold"
                  )}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {notification.sender && notification.sender.name && (
                      <>
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={notification.sender.avatar} />
                          <AvatarFallback className="text-xs">
                            {notification.sender.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {notification.sender.name}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.time).toLocaleString()}
                    </span>
                    {!notification.isRead && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="h-2 w-2 bg-blue-500 rounded-full" />
                      </>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!notification.isRead && (
                      <DropdownMenuItem onClick={() => onMarkRead(notification.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onArchive(notification.id)} className="text-red-600">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")

  useEffect(() => {
    api<Notification[]>("/api/notifications").then(setNotifications).catch(() => {})
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 200)
    return () => clearTimeout(id)
  }, [search])

  const filteredNotifications = useMemo(() => notifications.filter(notification => {
    if (filter === "unread" && notification.isRead) return false
    const q = debounced.toLowerCase()
    const inText = notification.title.toLowerCase().includes(q) || notification.message.toLowerCase().includes(q)
    return inText
  }), [notifications, filter, debounced])

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await api<Notification>(`/api/notifications/${id}`, { method: 'PATCH' }).catch(() => {})
  }

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await Promise.all(unread.map(n => api(`/api/notifications/${n.id}`, { method: 'PATCH' }).catch(() => {})))
  }

  const archiveNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    await api(`/api/notifications/${id}`, { method: 'DELETE' }).catch(() => {})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-sm rounded-full px-2 py-1 min-w-[24px] text-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your team's activities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications..."
              className="px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{debounced ? ' ' : ''}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {filter === "all" ? "All" : "Unread"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Notifications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("unread")}>
                Unread Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ProgressiveList
            items={filteredNotifications}
            initial={20}
            step={20}
            renderItem={(notification, index) => (
              <NotificationItem
                key={(notification as any).id}
                notification={notification as any}
                index={index}
                onMarkRead={markAsRead}
                onArchive={archiveNotification}
              />
            )}
            containerClassName="space-y-4"
          />
        )}
      </div>
    </div>
  )
}
