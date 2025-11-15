'use client'

import { useState } from 'react'
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader"
import { MetricCard } from "@/components/analytics/MetricCard"
import { ContributorsCard } from "@/components/analytics/ContributorsCard"
import { ActivitiesCard } from "@/components/analytics/ActivitiesCard"
import { usePersonalAnalytics } from '@/lib/hooks/usePersonalAnalytics'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('7d')
  
  // Personal Analytics
  const { data: personalData, loading: personalLoading, refresh: refreshPersonal, lastUpdated: personalLastUpdated } = usePersonalAnalytics({ timeframe })

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        title="Personal Analytics"
        description="Your personal activity and performance metrics"
        data={personalData}
        loading={personalLoading}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onRefresh={refreshPersonal}
        lastUpdated={personalLastUpdated}
      />

      {/* Personal Analytics */}
      {personalData && (
        <div className="space-y-6">
          {/* Personal Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Your Projects"
              description="Projects you own or are member of"
              metric={personalData?.projects?.totalProjects || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
            />
            <MetricCard
              title="Active Projects"
              description="Currently active projects"
              metric={personalData?.projects?.activeProjects || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
            />
            <MetricCard
              title="Total Tasks"
              description="All your tasks"
              metric={personalData?.tasks?.totalTasks || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
            />
            <MetricCard
              title="Completed Tasks"
              description="Tasks you've finished"
              metric={personalData?.tasks?.completedTasks || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
            />
          </div>

          {/* Personal Activity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {personalData?.projects?.teamContributions && (
              <ContributorsCard
                title="Your Team Contributors"
                contributors={personalData?.projects?.teamContributions || []}
              />
            )}
            {personalData?.activity?.recentActivities && (
              <ActivitiesCard
                title="Your Recent Activities"
                activities={personalData?.activity?.recentActivities || []}
              />
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {personalLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!personalLoading && !personalData && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground mb-4">
                Analytics data is not available at the moment.
              </p>
              <Button onClick={refreshPersonal} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}