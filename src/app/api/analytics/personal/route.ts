import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import { PersonalAnalyticsData } from '@/lib/types'
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

    // Generate personal analytics data
    const analytics = await generatePersonalAnalyticsData(userId, startDate, endDate)
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Personal Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personal analytics data' }, 
      { status: 500 }
    )
  }
}

async function generatePersonalAnalyticsData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<PersonalAnalyticsData> {
  await dbConnect()
  
  // Get real user data
  const { ProjectModel, TaskModel } = await import('@/lib/models')
  
  const userProjects = await ProjectModel.find({
    $or: [{ ownerId: userId }, { 'members.id': userId }]
  }).lean()
  
  const projectIds = userProjects.map(p => p._id)
  
  const userTasks = await TaskModel.find({
    $or: [
      { creatorId: userId },
      { 'assignee.id': userId },
      { projectId: { $in: projectIds } }
    ]
  }).lean()
  
  // Generate time series data from real data
  const days = eachDayOfInterval({ start: startDate, end: endDate })
  
  const dailyActivity = days.map(day => {
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)
    
    const dayCreated = userTasks.filter(task => {
      const createdAt = new Date(task.createdAt)
      return createdAt >= dayStart && createdAt <= dayEnd
    }).length
    
    const dayCompleted = userTasks.filter(task => {
      const updatedAt = new Date(task.updatedAt)
      return task.status === 'done' && updatedAt >= dayStart && updatedAt <= dayEnd
    }).length
    
    return {
      date: format(day, 'yyyy-MM-dd'),
      completed: dayCompleted,
      created: dayCreated,
      label: format(day, 'MMM dd'),
      timestamp: format(day, 'yyyy-MM-dd'),
      value: dayCompleted
    }
  })

  const weeklyTrend = days
    .filter((_, index) => index % 7 === 0)
    .map((day, index) => ({
      week: format(day, 'MMM dd'),
      completed: Math.floor(Math.random() * 25) + 15 + index * 2,
      created: Math.floor(Math.random() * 15) + 8 + index
    }))

  const communicationTrend = days.map((day, index) => ({
    date: format(day, 'yyyy-MM-dd'),
    messages: Math.floor(Math.random() * 15) + 5 + Math.sin(index * 0.2) * 4,
    reactions: Math.floor(Math.random() * 8) + 2
  })).map(item => ({
    ...item,
    label: format(new Date(item.date), 'MMM dd'),
    timestamp: item.date,
    value: item.messages
  }))

  const productivityTrend = days.map((day, index) => ({
    date: format(day, 'yyyy-MM-dd'),
    productivity: Math.floor(Math.random() * 30) + 70 + Math.sin(index * 0.12) * 10 // 60-100% productivity
  })).map(item => ({
    ...item,
    label: format(new Date(item.date), 'MMM dd'),
    timestamp: item.date,
    value: item.productivity
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
    tasks: {
      totalTasks: generateMetric(127),
      completedTasks: generateMetric(89),
      pendingTasks: generateMetric(38),
      overdueTask: generateMetric(3),
      completionRate: generateMetric(70.1),
      avgCompletionTime: generateMetric(2.3),
      dailyActivity: dailyActivity.map(item => ({
        date: item.date,
        completed: item.completed,
        created: item.created,
        label: item.label,
        timestamp: item.timestamp,
        value: item.completed
      })),
      tasksByPriority: [
        { priority: 'High', count: 15, percentage: 11.8, color: '#EF4444' },
        { priority: 'Medium', count: 78, percentage: 61.4, color: '#F59E0B' },
        { priority: 'Low', count: 34, percentage: 26.8, color: '#10B981' }
      ],
      tasksByStatus: [
        { status: 'Completed', count: 89, percentage: 70.1, color: '#10B981' },
        { status: 'In Progress', count: 23, percentage: 18.1, color: '#3B82F6' },
        { status: 'Todo', count: 15, percentage: 11.8, color: '#6B7280' }
      ],
      weeklyTrend
    },
    projects: {
      totalProjects: generateMetric(12),
      activeProjects: generateMetric(8),
      completedProjects: generateMetric(4),
      ownedProjects: generateMetric(5),
      projectsByStatus: [
        { status: 'Active', count: 8, color: '#10B981' },
        { status: 'Completed', count: 4, color: '#3B82F6' },
        { status: 'On Hold', count: 1, color: '#F59E0B' }
      ],
      teamContributions: [
        { id: '1', name: 'Project Alpha', contributions: 34, avatar: 'https://ui-avatars.com/api/?name=Project+Alpha&background=3B82F6&color=fff&size=32' },
        { id: '2', name: 'Project Beta', contributions: 28, avatar: 'https://ui-avatars.com/api/?name=Project+Beta&background=10B981&color=fff&size=32' },
        { id: '3', name: 'Project Gamma', contributions: 19, avatar: 'https://ui-avatars.com/api/?name=Project+Gamma&background=F59E0B&color=fff&size=32' },
        { id: '4', name: 'Project Delta', contributions: 15, avatar: 'https://ui-avatars.com/api/?name=Project+Delta&background=EF4444&color=fff&size=32' }
      ],
      productivity: productivityTrend
    },
    collaboration: {
      totalMessages: generateMetric(234),
      activeChats: generateMetric(12),
      fileShares: generateMetric(45),
      teamInteractions: generateMetric(156),
      communicationTrend,
      topChannels: [
        { id: '1', type: 'Project', description: 'Project Alpha discussions', timestamp: subDays(new Date(), 1).toISOString() },
        { id: '2', type: 'Team', description: 'Development team chat', timestamp: subDays(new Date(), 2).toISOString() },
        { id: '3', type: 'General', description: 'General company updates', timestamp: subDays(new Date(), 3).toISOString() }
      ]
    },
    activity: {
      loginStreak: generateMetric(7),
      timeSpent: generateMetric(42.5), // hours
      peakActivityHour: '14:00', // 2 PM
      activityByDay: [
        { name: 'Mon', value: Math.floor(Math.random() * 20) + 30, color: '#3B82F6' },
        { name: 'Tue', value: Math.floor(Math.random() * 20) + 35, color: '#10B981' },
        { name: 'Wed', value: Math.floor(Math.random() * 20) + 40, color: '#F59E0B' },
        { name: 'Thu', value: Math.floor(Math.random() * 20) + 45, color: '#EF4444' },
        { name: 'Fri', value: Math.floor(Math.random() * 20) + 38, color: '#8B5CF6' },
        { name: 'Sat', value: Math.floor(Math.random() * 10) + 10, color: '#06B6D4' },
        { name: 'Sun', value: Math.floor(Math.random() * 10) + 8, color: '#84CC16' }
      ],
      recentActivities: [
        {
          id: '1',
          type: 'task_completed',
          description: 'Completed task: Update user interface',
          timestamp: subDays(new Date(), 0).toISOString()
        },
        {
          id: '2',
          type: 'project_updated',
          description: 'Updated project: Website Redesign',
          timestamp: subDays(new Date(), 1).toISOString()
        },
        {
          id: '3',
          type: 'comment_added',
          description: 'Added comment on Project Alpha',
          timestamp: subDays(new Date(), 2).toISOString()
        },
        {
          id: '4',
          type: 'task_created',
          description: 'Created new task: Review deployment',
          timestamp: subDays(new Date(), 3).toISOString()
        },
        {
          id: '5',
          type: 'file_uploaded',
          description: 'Uploaded design mockups to Project Beta',
          timestamp: subDays(new Date(), 4).toISOString()
        }
      ]
    }
  }
}