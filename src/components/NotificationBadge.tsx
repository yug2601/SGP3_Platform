"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/lib/hooks/useNotifications"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
  className?: string
  showCount?: boolean
}

export function NotificationBadge({ className, showCount = true }: NotificationBadgeProps) {
  const { unreadCount } = useNotifications()

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
    >
      <Link href="/notifications">
        <Bell className="h-5 w-5" />
        {showCount && unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
        <span className="sr-only">
          {unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
        </span>
      </Link>
    </Button>
  )
}