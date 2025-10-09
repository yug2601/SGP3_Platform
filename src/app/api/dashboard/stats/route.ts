import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel, ActivityModel, NotificationModel } from '@/lib/models'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Get user's projects
    const projects = await ProjectModel.find({
      $or: [{ ownerId: userId }, { 'members.id': userId }],
      archived: { $ne: true }
    }).lean()

    const projectIds = projects.map(p => p._id)

    // Get user's tasks
    const tasks = await TaskModel.find({
      $or: [
        { creatorId: userId },
        { 'assignee.id': userId },
        { projectId: { $in: projectIds } }
      ]
    }).lean()

    // Get recent activities (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentActivities = await ActivityModel.countDocuments({
      userId,
      time: { $gte: weekAgo }
    })

    // Get notifications count
    const unreadNotifications = await NotificationModel.countDocuments({
      userId,
      isRead: false
    })

    // Calculate various statistics
    const stats = {
      // Project statistics
      projects: {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length,
        onHold: projects.filter(p => p.status === 'on-hold').length,
        owned: projects.filter(p => p.ownerId === userId).length,
        member: projects.filter(p => p.ownerId !== userId).length
      },

      // Task statistics
      tasks: {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'todo').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        assigned: tasks.filter(t => t.assignee?.id === userId).length,
        created: tasks.filter(t => t.creatorId === userId).length,
        highPriority: tasks.filter(t => t.priority === 'high').length,
        overdue: tasks.filter(t => {
          return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
        }).length,
        dueToday: tasks.filter(t => {
          if (!t.dueDate) return false
          const today = new Date().toDateString()
          return new Date(t.dueDate).toDateString() === today
        }).length,
        dueThisWeek: tasks.filter(t => {
          if (!t.dueDate) return false
          const now = new Date()
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          return new Date(t.dueDate) <= weekFromNow && new Date(t.dueDate) >= now
        }).length
      },

      // Activity statistics
      activity: {
        thisWeek: recentActivities,
        total: await ActivityModel.countDocuments({ userId })
      },

      // Notification statistics
      notifications: {
        unread: unreadNotifications,
        total: await NotificationModel.countDocuments({ userId })
      },

      // Productivity metrics
      productivity: {
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0,
        averageProjectProgress: projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 })
  }
}