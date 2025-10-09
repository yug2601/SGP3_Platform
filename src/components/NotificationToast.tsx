"use client"

import { useEffect, useRef } from "react"
import { useNotifications } from "@/lib/hooks/useNotifications"
import { useToast } from "@/components/ui/toast"

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "comment":
      return "💬"
    case "task_assigned":
      return "👤"
    case "project_update":
      return "✅"
    case "team_invite":
      return "📩"
    case "deadline":
      return "⚠️"
    case "task_completed":
      return "🎉"
    default:
      return "🔔"
  }
}

export function NotificationToast() {
  const { notifications } = useNotifications()
  const { show, Toast } = useToast()
  const processedNotifications = useRef(new Set<string>())

  useEffect(() => {
    // Show toast for new notifications
    if (notifications.length > 0) {
      const latestNotification = notifications[0]
      
      // Only show toast for new unread notifications
      if (!latestNotification.isRead && !processedNotifications.current.has(latestNotification.id)) {
        processedNotifications.current.add(latestNotification.id)
        
        const icon = getNotificationIcon(latestNotification.type)
        show(`${icon} ${latestNotification.title}`)
      }
    }
  }, [notifications, show])

  return <Toast />
}