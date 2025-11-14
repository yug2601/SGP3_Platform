"use client"

import React, { useMemo, useState, memo } from "react"
import { motion } from "@/components/motion"
import { 
  Bell, 
  CheckCircle, 
  Archive, 
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  AlertTriangle,
  Trash2
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
import { useNotifications } from "@/lib/hooks/useNotifications"
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

const ArchivedNotificationItem = memo(function ArchivedNotificationItem({ 
  notification, 
  index, 
  isArchived,
  onMarkRead, 
  onArchive, 
  onUnarchive, 
  onDelete 
}: {
  notification: Notification
  index: number
  isArchived: boolean
  onMarkRead: (id: string) => void
  onArchive: (id: string) => void
  onUnarchive: (id: string) => void
  onDelete: (id: string) => void
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
          !notification.isRead && !isArchived && "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
          isArchived && "opacity-80"
        )}
        onClick={() => !notification.isRead && !isArchived && onMarkRead(notification.id)}
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
                    !notification.isRead && !isArchived && "font-semibold"
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
                    {!notification.isRead && !isArchived && (
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
                    {!notification.isRead && !isArchived && (
                      <DropdownMenuItem onClick={() => onMarkRead(notification.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    {!isArchived ? (
                      <DropdownMenuItem onClick={() => onArchive(notification.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onUnarchive(notification.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Unarchive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(notification.id)
                      }} 
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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
  const {
    notifications,
    archivedNotifications,
    loading,
    loadingArchived,
    unreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    unarchiveNotification,
    deleteNotification,
    loadArchivedNotifications,
  } = useNotifications()
  
  const [filter, setFilter] = useState<"active" | "archived">("active")
  const [search, setSearch] = useState("")
  const [debounced, setDebounced] = useState("")

  const handleDeleteNotification = async (id: string) => {
    if (confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
      await deleteNotification(id)
    }
  }

  // Load archived notifications when switching tabs
  React.useEffect(() => {
    if (filter === "archived" && archivedNotifications.length === 0) {
      loadArchivedNotifications()
    }
  }, [filter, archivedNotifications.length, loadArchivedNotifications])

  // Use useEffect instead of useMemo for side effects
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 200)
    return () => clearTimeout(id)
  }, [search])

  const currentNotifications = filter === "active" ? notifications : archivedNotifications
  const currentLoading = filter === "active" ? loading : loadingArchived

  const filteredNotifications = useMemo(() => currentNotifications.filter(notification => {
    const q = debounced.toLowerCase()
    const inText = notification.title.toLowerCase().includes(q) || notification.message.toLowerCase().includes(q)
    return inText
  }), [currentNotifications, debounced])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {filter === "active" && unreadCount > 0 && (
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
          </div>
          {filter === "active" && unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-4 border-b">
        <button
          onClick={() => setFilter("active")}
          className={cn(
            "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
            filter === "active" 
              ? "border-blue-500 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Active
          {unreadCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setFilter("archived")}
          className={cn(
            "pb-2 px-1 text-sm font-medium border-b-2 transition-colors",
            filter === "archived" 
              ? "border-blue-500 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Archive className="h-4 w-4 mr-1 inline" />
          Archived
          {archivedNotifications.length > 0 && (
            <span className="ml-2 bg-gray-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {archivedNotifications.length}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {currentLoading ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading notifications...</p>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              {filter === "archived" ? (
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              ) : (
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              )}
              <p className="text-muted-foreground">
                {filter === "archived" ? "No archived notifications" : "No active notifications"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <ProgressiveList
            items={filteredNotifications}
            initial={20}
            step={20}
            renderItem={(notification, index) => (
              <ArchivedNotificationItem
                key={(notification as any).id}
                notification={notification as any}
                index={index}
                isArchived={filter === "archived"}
                onMarkRead={markAsRead}
                onArchive={archiveNotification}
                onUnarchive={unarchiveNotification}
                onDelete={handleDeleteNotification}
              />
            )}
            containerClassName="space-y-4"
          />
        )}
      </div>
    </div>
  )
}
