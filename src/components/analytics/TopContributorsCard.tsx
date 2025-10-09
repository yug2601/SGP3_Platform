'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface TopContributor {
  id: string
  name: string
  contributions: number
  avatar?: string
}

interface TopContributorsCardProps {
  title: string
  description?: string
  contributors: TopContributor[]
  className?: string
}

export function TopContributorsCard({ 
  title, 
  description, 
  contributors,
  className 
}: TopContributorsCardProps) {
  const maxContributions = Math.max(...contributors.map(c => c.contributions))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contributors.map((contributor, index) => (
            <div key={contributor.id} className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar} alt={contributor.name} />
                    <AvatarFallback className="text-xs">
                      {contributor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{contributor.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress 
                      value={(contributor.contributions / maxContributions) * 100} 
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                      {contributor.contributions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}