import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import { DashboardAnalytics } from '@/lib/types'
import { subDays, subYears, format, eachDayOfInterval } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '30d'
    
    await dbConnect()
    
    // Get date range based on timeframe
    const endDate = new Date()
    let startDate: Date
    
    switch (timeframe) {
      case '24h':
        startDate = subDays(endDate, 1)
        break
      case '7d':
        startDate = subDays(endDate, 7)
        break
      case '30d':
        startDate = subDays(endDate, 30)
        break
      case '90d':
        startDate = subDays(endDate, 90)
        break
      case '1y':
        startDate = subYears(endDate, 1)
        break
      default:
        startDate = subDays(endDate, 30)
    }

    // Generate mock data (in production, this would come from your database)
    const analytics = await generateAnalyticsData(userId, startDate, endDate)
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' }, 
      { status: 500 }
    )
  }
}

async function generateAnalyticsData(
  userId: string, 
  startDate: Date, 
  endDate: Date
): Promise<DashboardAnalytics> {
  const now = new Date()
  
  // Generate time series data
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  
  const dailyActivity = days.map(day => ({
    timestamp: format(day, 'yyyy-MM-dd'),
    value: Math.floor(Math.random() * 100) + 20,
    label: format(day, 'MMM dd')
  }))

  const weeklyTrend = days
    .filter((_, index) => index % 7 === 0)
    .map(day => ({
      timestamp: format(day, 'yyyy-MM-dd'),
      value: Math.floor(Math.random() * 300) + 50,
      label: format(day, 'MMM dd')
    }))

  // Helper function to generate metric with trend
  const generateMetric = (baseValue: number, variance: number = 0.2) => {
    const current = Math.floor(baseValue * (1 + (Math.random() - 0.5) * variance))
    const previous = Math.floor(baseValue * (1 + (Math.random() - 0.5) * variance))
    const change = current - previous
    const changePercent = previous > 0 ? (change / previous) * 100 : 0
    
    return {
      current,
      previous,
      change,
      changePercent: Math.round(changePercent * 100) / 100,
      trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'stable' as const
    }
  }

  return {
    overview: {
      totalUsers: 1247,
      totalProjects: 89,
      totalTasks: 2341,
      revenue: 145000
    },
    tasks: {
      totalTasks: generateMetric(2341),
      completedTasks: generateMetric(1876),
      inProgressTasks: generateMetric(465),
      overdueTask: generateMetric(23),
      completionRate: generateMetric(80),
      avgCompletionTime: generateMetric(3.2),
      tasksByStatus: [
        { status: 'Completed', count: 1876, percentage: 80.1 },
        { status: 'In Progress', count: 465, percentage: 19.9 },
        { status: 'Todo', count: 187, percentage: 8.0 },
        { status: 'Blocked', count: 23, percentage: 1.0 }
      ],
      tasksByPriority: [
        { priority: 'High', count: 234, percentage: 10.0 },
        { priority: 'Medium', count: 1403, percentage: 59.9 },
        { priority: 'Low', count: 704, percentage: 30.1 }
      ],
      dailyActivity,
      weeklyTrend
    },
    projects: {
      totalProjects: generateMetric(89),
      activeProjects: generateMetric(67),
      completedProjects: generateMetric(22),
      projectsByStatus: [
        { status: 'Active', count: 67, percentage: 75.3 },
        { status: 'Completed', count: 22, percentage: 24.7 },
        { status: 'On Hold', count: 8, percentage: 9.0 },
        { status: 'Cancelled', count: 3, percentage: 3.4 }
      ],
      teamProductivity: dailyActivity.map(day => ({
        ...day,
        value: Math.floor(Math.random() * 50) + 10
      })),
      resourceAllocation: [
        { name: 'Development', value: 45, color: '#3B82F6' },
        { name: 'Design', value: 25, color: '#10B981' },
        { name: 'Marketing', value: 15, color: '#F59E0B' },
        { name: 'QA', value: 10, color: '#EF4444' },
        { name: 'Other', value: 5, color: '#8B5CF6' }
      ]
    },
    users: {
      activeUsers: generateMetric(1247),
      newUsers: generateMetric(89),
      userRetention: generateMetric(87.5),
      userEngagement: generateMetric(73.2),
      userActivity: dailyActivity.map(day => ({
        ...day,
        value: Math.floor(Math.random() * 200) + 50
      })),
      usersByRole: [
        { role: 'Developer', count: 523, percentage: 41.9 },
        { role: 'Designer', count: 187, percentage: 15.0 },
        { role: 'Manager', count: 234, percentage: 18.8 },
        { role: 'QA', count: 156, percentage: 12.5 },
        { role: 'Other', count: 147, percentage: 11.8 }
      ],
      topContributors: [
        { id: '1', name: 'Alice Johnson', contributions: 234, avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson&background=3B82F6&color=fff&size=32' },
        { id: '2', name: 'Bob Smith', contributions: 187, avatar: 'https://ui-avatars.com/api/?name=Bob+Smith&background=10B981&color=fff&size=32' },
        { id: '3', name: 'Carol Davis', contributions: 156, avatar: 'https://ui-avatars.com/api/?name=Carol+Davis&background=F59E0B&color=fff&size=32' },
        { id: '4', name: 'David Wilson', contributions: 142, avatar: 'https://ui-avatars.com/api/?name=David+Wilson&background=EF4444&color=fff&size=32' },
        { id: '5', name: 'Eva Brown', contributions: 128, avatar: 'https://ui-avatars.com/api/?name=Eva+Brown&background=8B5CF6&color=fff&size=32' }
      ]
    },
    system: {
      responseTime: generateMetric(145),
      uptime: generateMetric(99.9),
      errorRate: generateMetric(0.3),
      apiCalls: generateMetric(45670),
      storageUsed: generateMetric(67.8),
      performanceMetrics: dailyActivity.map(day => ({
        ...day,
        value: Math.floor(Math.random() * 50) + 100
      })),
      errorsByType: [
        { type: '4xx Client Errors', count: 123, percentage: 65.4 },
        { type: '5xx Server Errors', count: 45, percentage: 23.9 },
        { type: 'Network Timeouts', count: 20, percentage: 10.7 }
      ]
    },
    collaboration: {
      totalMessages: generateMetric(15678),
      activeChats: generateMetric(234),
      fileShares: generateMetric(567),
      meetingsHeld: generateMetric(89),
      communicationTrend: dailyActivity.map(day => ({
        ...day,
        value: Math.floor(Math.random() * 300) + 100
      })),
      channelActivity: [
        { channel: '#general', messages: 4567, users: 89 },
        { channel: '#development', messages: 3421, users: 67 },
        { channel: '#design', messages: 2134, users: 45 },
        { channel: '#marketing', messages: 1876, users: 34 },
        { channel: '#qa', messages: 1234, users: 23 }
      ]
    },
    financial: {
      revenue: generateMetric(145000),
      expenses: generateMetric(67000),
      profit: generateMetric(78000),
      budgetUtilization: generateMetric(73.5),
      revenueByProject: [
        { project: 'Project Alpha', revenue: 45000, percentage: 31.0 },
        { project: 'Project Beta', revenue: 38000, percentage: 26.2 },
        { project: 'Project Gamma', revenue: 32000, percentage: 22.1 },
        { project: 'Project Delta', revenue: 30000, percentage: 20.7 }
      ],
      expensesByCategory: [
        { category: 'Salaries', amount: 35000, percentage: 52.2 },
        { category: 'Infrastructure', amount: 15000, percentage: 22.4 },
        { category: 'Marketing', amount: 8000, percentage: 11.9 },
        { category: 'Tools & Software', amount: 6000, percentage: 9.0 },
        { category: 'Other', amount: 3000, percentage: 4.5 }
      ],
      monthlyTrend: weeklyTrend.map(week => ({
        ...week,
        value: Math.floor(Math.random() * 20000) + 10000
      }))
    },
    lastUpdated: now.toISOString()
  }
}