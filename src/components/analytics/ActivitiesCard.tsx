'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, MessageCircle, FileText, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  type: string
  description: string
  timestamp: string | Date
  user?: {
    name: string
    avatar?: string
  }
  metadata?: Record<string, any>
}

interface ActivitiesCardProps {
  title: string
  activities: ActivityItem[]
}

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'message':
    case 'chat':
      return <MessageCircle className="h-4 w-4" />
    case 'file':
    case 'upload':
      return <FileText className="h-4 w-4" />
    case 'team':
    case 'collaboration':
      return <Users className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

const getActivityBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (type.toLowerCase()) {
    case 'message':
    case 'chat':
      return 'default'
    case 'file':
    case 'upload':
      return 'secondary'
    case 'team':
    case 'collaboration':
      return 'outline'
    default:
      return 'secondary'
  }
}

export function ActivitiesCard({ title, activities }: ActivitiesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities?.map((activity, index) => (
            <div key={`${activity.id}-${index}`} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium truncate">
                    {activity.description}
                  </p>
                  <Badge variant={getActivityBadgeVariant(activity.type)} className="ml-2">
                    {activity.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-1">
                  {activity.user && (
                    <p className="text-xs text-muted-foreground">
                      by {activity.user.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          )) || (
            <p className="text-sm text-muted-foreground">No activities data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}