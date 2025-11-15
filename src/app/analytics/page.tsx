'use client'

import { useState, useEffect } from 'react'
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader"
import { MetricCard } from "@/components/analytics/MetricCard"
import { LineChartCard } from "@/components/analytics/LineChartCard"
import { PieChartCard } from "@/components/analytics/PieChartCard"
import { ContributorsCard } from "@/components/analytics/ContributorsCard"
import { ActivitiesCard } from "@/components/analytics/ActivitiesCard"
import { usePersonalAnalytics } from '@/lib/hooks/usePersonalAnalytics'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('7d')
  
  // Personal Analytics with dashboard data
  const { data: personalData, loading: personalLoading, refresh: refreshPersonal, lastUpdated: personalLastUpdated } = usePersonalAnalytics({ timeframe })
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  
  // Load dashboard data for personal analytics
  useEffect(() => {
    setDashboardLoading(true)
    fetch('/api/analytics/dashboard')
      .then(res => res.json())
      .then(data => {
        setDashboardData(data)
        setDashboardLoading(false)
      })
      .catch(error => {
        console.error('Failed to load dashboard data:', error)
        setDashboardLoading(false)
      })
  }, [timeframe])

  const isLoading = personalLoading || dashboardLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        title="Personal Analytics"
        description="Your personal activity and performance metrics"
        data={personalData}
        loading={isLoading}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onRefresh={refreshPersonal}
        lastUpdated={personalLastUpdated}
      />

      {/* Personal Analytics */}
      {(personalData || dashboardData) && (
        <div className="space-y-6">
          {/* Personal Metrics - Use dashboard data if available, fallback to personal data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Your Projects"
              description="Projects you own or are member of"
              metric={dashboardData?.projects?.totalProjects || personalData?.projects?.totalProjects || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
            />
            <MetricCard
              title="Active Projects"
              description="Currently active projects"
              metric={dashboardData?.projects?.activeProjects || personalData?.projects?.activeProjects || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
            />
            <MetricCard
              title="Total Tasks"
              description="All your tasks"
              metric={dashboardData?.tasks?.totalTasks || personalData?.tasks?.totalTasks || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
            />
            <MetricCard
              title="Completed Tasks"
              description="Tasks you've finished"
              metric={dashboardData?.tasks?.completedTasks || personalData?.tasks?.completedTasks || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
            />
          </div>

          {/* Personal Charts - Use dashboard data if available */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Use dashboard data for charts if available */}
            {(dashboardData?.tasks?.dailyActivity || personalData?.tasks?.dailyActivity) && (
              <LineChartCard
                title="Your Daily Task Activity"
                description="Your task completion over time"
                data={(dashboardData?.tasks?.dailyActivity || personalData?.tasks?.dailyActivity).map((item: any) => ({
                  timestamp: item.date || item.timestamp || new Date().toISOString(),
                  value: item.completed || item.value || 0,
                  label: item.label || new Date(item.date || item.timestamp).toLocaleDateString()
                }))}
                color="#3B82F6"
              />
            )}
            
            {(dashboardData?.collaboration?.communicationTrend || personalData?.collaboration?.communicationTrend) && (
              <LineChartCard
                title="Communication Activity"
                description="Your messaging and collaboration"
                data={(dashboardData?.collaboration?.communicationTrend || personalData?.collaboration?.communicationTrend).map((item: any) => ({
                  timestamp: item.date || item.timestamp || new Date().toISOString(),
                  value: item.messages || item.value || 0,
                  label: item.label || new Date(item.date || item.timestamp).toLocaleDateString()
                }))}
                color="#10B981"
              />
            )}

            {(dashboardData?.tasks?.tasksByStatus || personalData?.tasks?.tasksByStatus) && (
              <PieChartCard
                title="Your Tasks by Status"
                description="Distribution of your task statuses"
                data={dashboardData?.tasks?.tasksByStatus || personalData?.tasks?.tasksByStatus}
                dataKey="count"
                nameKey="status"
              />
            )}
            
            {(dashboardData?.projects?.projectsByStatus || personalData?.projects?.projectsByStatus) && (
              <PieChartCard
                title="Your Projects by Status"
                description="Status breakdown of your projects"
                data={dashboardData?.projects?.projectsByStatus || personalData?.projects?.projectsByStatus}
                dataKey="count"
                nameKey="status"
              />
            )}
          </div>

          {/* Personal Activity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(dashboardData?.users?.topContributors || personalData?.projects?.teamContributions) && (
              <ContributorsCard
                title="Top Contributors"
                contributors={dashboardData?.users?.topContributors || personalData?.projects?.teamContributions || []}
              />
            )}
            {personalData?.activity?.recentActivities && (
              <ActivitiesCard
                title="Recent Activities"
                activities={personalData?.activity?.recentActivities || []}
              />
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !personalData && !dashboardData && (
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