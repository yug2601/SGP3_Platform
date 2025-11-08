'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from 'lucide-react'

import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader'
import { MetricCard } from '@/components/analytics/MetricCard'
import { TopContributorsCard } from '@/components/analytics/TopContributorsCard'
import { ActivityFeedCard } from '@/components/analytics/ActivityFeedCard'

// Dynamic imports for chart components to avoid SSR issues
const LineChartCard = dynamic(() => import('@/components/analytics/LineChartCard').then(m => ({ default: m.LineChartCard })), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />
})

const PieChartCard = dynamic(() => import('@/components/analytics/PieChartCard').then(m => ({ default: m.PieChartCard })), { 
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />
})

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('30d')
  const { data, loading, error, refresh, setTimeframe: updateTimeframe, lastUpdated } = useAnalytics({
    timeframe,
    refreshInterval: 30000,
    autoRefresh: true
  })

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe)
    updateTimeframe(newTimeframe)
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4" />
              <p>Failed to load analytics data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <AnalyticsHeader
        data={data}
        loading={loading}
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
        onRefresh={refresh}
        lastUpdated={lastUpdated}
      />

      {loading && !data ? (
        <LoadingSkeleton />
      ) : data ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Tasks"
                description="All tasks in the system"
                metric={data.tasks.totalTasks}
              />
              <MetricCard
                title="Completed Tasks"
                description="Successfully finished tasks"
                metric={data.tasks.completedTasks}
              />
              <MetricCard
                title="Active Users"
                description="Currently active users"
                metric={data.users.activeUsers}
              />
              <MetricCard
                title="Revenue"
                description="Total platform revenue"
                metric={data.financial?.revenue || { current: 0, previous: 0, change: 0, changePercent: 0, trend: 'stable' }}
                format="currency"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartCard
                title="Daily Activity"
                description="Task completion trend over time"
                data={data.tasks.dailyActivity}
                color="#3B82F6"
                gradient={true}
              />
              
              <PieChartCard
                title="Tasks by Status"
                description="Distribution of task statuses"
                data={data.tasks.tasksByStatus}
                dataKey="count"
                nameKey="status"
              />
              
              <LineChartCard
                title="User Activity"
                description="User engagement over time"
                data={data.users.userActivity}
                color="#10B981"
              />
              
              <PieChartCard
                title="Users by Role"
                description="User distribution across roles"
                data={data.users.usersByRole}
                dataKey="count"
                nameKey="role"
              />
            </div>

            {/* Additional Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopContributorsCard
                title="Top Contributors"
                description="Most active team members"
                contributors={data.users.topContributors}
              />
              
              <ActivityFeedCard
                title="Channel Activity"
                description="Communication across channels"
                activities={data.collaboration.channelActivity}
              />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Tasks"
                metric={data.tasks.totalTasks}
              />
              <MetricCard
                title="Completion Rate"
                metric={data.tasks.completionRate}
                format="percentage"
              />
              <MetricCard
                title="Avg Completion Time"
                metric={data.tasks.avgCompletionTime}
                format="time"
                suffix="d"
              />
              <MetricCard
                title="Overdue Tasks"
                metric={data.tasks.overdueTask}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartCard
                title="Task Creation Trend"
                description="New tasks created over time"
                data={data.tasks.dailyActivity}
                color="#F59E0B"
                gradient={true}
              />
              
              <PieChartCard
                title="Tasks by Priority"
                description="Priority distribution"
                data={data.tasks.tasksByPriority}
                dataKey="count"
                nameKey="priority"
              />
              
              <LineChartCard
                title="Weekly Progress"
                description="Task completion weekly trend"
                data={data.tasks.weeklyTrend}
                color="#8B5CF6"
              />
              
              <PieChartCard
                title="Task Status Breakdown"
                description="Current status distribution"
                data={data.tasks.tasksByStatus}
                dataKey="percentage"
                nameKey="status"
                type="bar"
              />
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                title="Total Projects"
                metric={data.projects.totalProjects}
              />
              <MetricCard
                title="Active Projects"
                metric={data.projects.activeProjects}
              />
              <MetricCard
                title="Completed Projects"
                metric={data.projects.completedProjects}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PieChartCard
                title="Projects by Status"
                description="Current project distribution"
                data={data.projects.projectsByStatus}
                dataKey="count"
                nameKey="status"
              />
              
              <PieChartCard
                title="Resource Allocation"
                description="Team resource distribution"
                data={data.projects.resourceAllocation}
                dataKey="value"
                nameKey="name"
              />
              
              <LineChartCard
                title="Team Productivity"
                description="Project completion trends"
                data={data.projects.teamProductivity}
                color="#EF4444"
                gradient={true}
              />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Active Users"
                metric={data.users.activeUsers}
              />
              <MetricCard
                title="New Users"
                metric={data.users.newUsers}
              />
              <MetricCard
                title="Retention Rate"
                metric={data.users.userRetention}
                format="percentage"
              />
              <MetricCard
                title="Engagement Score"
                metric={data.users.userEngagement}
                format="percentage"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartCard
                title="User Growth"
                description="User acquisition over time"
                data={data.users.userActivity}
                color="#06B6D4"
                gradient={true}
              />
              
              <PieChartCard
                title="User Distribution"
                description="Users by role"
                data={data.users.usersByRole}
                dataKey="count"
                nameKey="role"
              />
              
              <TopContributorsCard
                title="Top Performers"
                description="Most productive team members"
                contributors={data.users.topContributors}
              />
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Messages Sent"
                metric={data.collaboration.totalMessages}
              />
              <MetricCard
                title="Active Chats"
                metric={data.collaboration.activeChats}
              />
              <MetricCard
                title="Files Shared"
                metric={data.collaboration.fileShares}
              />
              <MetricCard
                title="Meetings Held"
                metric={data.collaboration.meetingsHeld}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartCard
                title="Communication Trend"
                description="Daily communication volume"
                data={data.collaboration.communicationTrend}
                color="#84CC16"
                gradient={true}
              />
              
              <ActivityFeedCard
                title="Channel Statistics"
                description="Message activity by channel"
                activities={data.collaboration.channelActivity}
              />
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <MetricCard
                title="Response Time"
                metric={data.system.responseTime}
                suffix="ms"
              />
              <MetricCard
                title="Uptime"
                metric={data.system.uptime}
                format="percentage"
              />
              <MetricCard
                title="Error Rate"
                metric={data.system.errorRate}
                format="percentage"
              />
              <MetricCard
                title="API Calls"
                metric={data.system.apiCalls}
              />
              <MetricCard
                title="Storage Used"
                metric={data.system.storageUsed}
                format="percentage"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LineChartCard
                title="Performance Metrics"
                description="System performance over time"
                data={data.system.performanceMetrics}
                color="#EC4899"
                gradient={true}
              />
              
              <PieChartCard
                title="Error Distribution"
                description="Types of errors encountered"
                data={data.system.errorsByType}
                dataKey="count"
                nameKey="type"
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  )
}