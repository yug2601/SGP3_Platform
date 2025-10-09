'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ActivityItem {
  channel: string
  messages: number
  users: number
}

interface ActivityFeedCardProps {
  title: string
  description?: string
  activities: ActivityItem[]
  className?: string
}

export function ActivityFeedCard({ 
  title, 
  description, 
  activities,
  className 
}: ActivityFeedCardProps) {
  const maxMessages = Math.max(...activities.map(a => a.messages))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{activity.channel}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {activity.users} users
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.messages} msgs
                    </span>
                  </div>
                </div>
                <Progress 
                  value={(activity.messages / maxMessages) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}