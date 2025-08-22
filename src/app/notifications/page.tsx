"use client"

import { useState } from "react"
import { motion } from "@/components/motion"
import { 
  Bell, 
  CheckCircle, 
  Archive, 
  Filter, 
  MoreHorizontal,
  MessageCircle,
  UserPlus,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const mockNotifications = [
  {
    id: "1",
    type: "comment",
    title: "New comment on Website Redesign",
    message: "Jane Smith commented: 'The new design looks great! Can we discuss the color scheme?'",
    time: "2 minutes ago",
    isRead: false,
    avatar: "",
    sender: "Jane Smith"
  },
  {
    id: "2",
    type: "task_assigned",
    title: "You were assigned to a new task",
    message: "Mike Johnson assigned you to 'Implement responsive navigation' in Website Redesign project",
    time: "1 hour ago",
    isRead: false,
    avatar: "",
    sender: "Mike Johnson"
  },
  {
    id: "3",
    type: "project_update",
    title: "Project status updated",
    message: "Website Redesign project progress updated to 75%",
    time: "3 hours ago",
    isRead: true,
    avatar: "",
    sender: "System"
  },
  {
    id: "4",
    type: "team_invite",
    title: "New team member joined",
    message: "Sarah Wilson joined the Website Redesign project team",
    time: "5 hours ago",
    isRead: true,
    avatar: "",
    sender: "Sarah Wilson"
  },
  {
    id: "5",
    type: "deadline",
    title: "Task deadline approaching",
    message: "Task 'Set up authentication system' is due in 2 days",
    time: "1 day ago",
    isRead: false,
    avatar: "",
    sender: "System"
  },
  {
    id: "6",
    type: "comment",
    title: "New comment on Mobile App Development",
    message: "Alex Chen commented: 'I've finished the API integration. Ready for testing.'",
    time: "2 days ago",
    isRead: true,
    avatar: "",
    sender: "Alex Chen"
  },
  {
    id: "7",
    type: "task_completed",
    title: "Task completed",
    message: "Lisa Wang completed 'Design user onboarding flow' in Mobile App Development",
    time: "3 days ago",
    isRead: true,
    avatar: "",
    sender: "Lisa Wang"
  }
]

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const archiveNotification = (id: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    )
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
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className={cn(
                  "transition-all hover:shadow-md cursor-pointer",
                  !notification.isRead && "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                )}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
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
                            {notification.sender !== "System" && (
                              <>
                                <Avatar className="h-5 w-5">
                                  <AvatarImage src={notification.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {notification.sender.split(" ").map(n => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  {notification.sender}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                              </>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
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
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => archiveNotification(notification.id)}
                              className="text-red-600"
                            >
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
          ))
        )}
      </div>
    </div>
  )
}
