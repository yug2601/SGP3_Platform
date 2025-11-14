'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'

interface Contributor {
  id: string
  name: string
  avatar?: string
  contributions: number
  role?: string
}

interface ContributorsCardProps {
  title: string
  contributors: Contributor[]
}

export function ContributorsCard({ title, contributors }: ContributorsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {contributors?.map((contributor, index) => (
            <div key={`${contributor.id}-${index}`} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={contributor.avatar} />
                    <AvatarFallback>
                      {contributor.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <p className="text-sm font-medium">{contributor.name}</p>
                  {contributor.role && (
                    <Badge variant="outline" className="text-xs">
                      {contributor.role}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{contributor.contributions}</p>
                <p className="text-xs text-muted-foreground">contributions</p>
              </div>
            </div>
          )) || (
            <p className="text-sm text-muted-foreground">No contributors data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}