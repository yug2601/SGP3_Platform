import { dbConnect } from '@/lib/db'
import { NotificationModel, UserModel } from '@/lib/models'
import { NotificationType } from '@/lib/types'
import { ActivityLogger } from '@/lib/activity-logger'

export interface NotificationData {
  userId: string
  type: NotificationType
  title: string
  message: string
  sender?: {
    id: string
    name: string
    avatar?: string
  }
  projectId?: string
  taskId?: string
  metadata?: any
}

export class NotificationService {
  /**
   * Send a notification respecting user preferences
   */
  static async send(data: NotificationData) {
    try {
      await dbConnect()

      // Get user preferences
      const user = await UserModel.findOne({ clerkId: data.userId }).lean()
      if (!user) return // User not found

      const preferences = (user as any).notificationSettings || {
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        projectUpdates: true,
        taskReminders: true,
        teamInvites: true
      }

      // Check if user wants this type of notification
      const shouldSend = this.shouldSendNotification(data.type, preferences)
      if (!shouldSend) return

      // Create notification in database
      const notification = new NotificationModel({
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        sender: data.sender,
        time: new Date(),
        isRead: false
      })

      await notification.save()

      // Log the notification activity
      await ActivityLogger.log({
        type: 'notification_sent',
        message: `Notification sent: ${data.title}`,
        userId: data.userId,
        projectId: data.projectId,
        taskId: data.taskId,
        metadata: {
          notificationType: data.type,
          title: data.title
        }
      })

      return notification
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  /**
   * Determine if notification should be sent based on user preferences
   */
  private static shouldSendNotification(type: NotificationType, preferences: any): boolean {
    switch (type) {
      case 'comment':
        return preferences.projectUpdates
      case 'task_assigned':
        return preferences.taskReminders
      case 'project_update':
        return preferences.projectUpdates
      case 'team_invite':
        return preferences.teamInvites
      case 'deadline':
        return preferences.taskReminders
      case 'task_completed':
        return preferences.projectUpdates
      default:
        return true
    }
  }

  /**
   * Send task assignment notification
   */
  static async notifyTaskAssignment(
    assigneeId: string, 
    taskTitle: string, 
    taskId: string, 
    projectId: string, 
    assigner?: { id: string; name: string; avatar?: string }
  ) {
    await this.send({
      userId: assigneeId,
      type: 'task_assigned',
      title: 'New Task Assignment',
      message: `You have been assigned to task "${taskTitle}"`,
      sender: assigner,
      taskId,
      projectId
    })
  }

  /**
   * Send project update notification
   */
  static async notifyProjectUpdate(
    userIds: string[], 
    projectName: string, 
    projectId: string, 
    updateMessage: string,
    updater?: { id: string; name: string; avatar?: string }
  ) {
    for (const userId of userIds) {
      await this.send({
        userId,
        type: 'project_update',
        title: 'Project Updated',
        message: `${projectName}: ${updateMessage}`,
        sender: updater,
        projectId
      })
    }
  }

  /**
   * Send team invitation notification
   */
  static async notifyTeamInvite(
    inviteeId: string, 
    projectName: string, 
    projectId: string,
    inviter?: { id: string; name: string; avatar?: string }
  ) {
    await this.send({
      userId: inviteeId,
      type: 'team_invite',
      title: 'Team Invitation',
      message: `You have been invited to join "${projectName}"`,
      sender: inviter,
      projectId
    })
  }

  /**
   * Send task deadline notification
   */
  static async notifyTaskDeadline(
    userIds: string[], 
    taskTitle: string, 
    taskId: string, 
    projectId: string, 
    dueDate: Date
  ) {
    const dueDateStr = dueDate.toLocaleDateString()
    
    for (const userId of userIds) {
      await this.send({
        userId,
        type: 'deadline',
        title: 'Task Deadline Reminder',
        message: `Task "${taskTitle}" is due on ${dueDateStr}`,
        taskId,
        projectId
      })
    }
  }

  /**
   * Send task completion notification
   */
  static async notifyTaskCompletion(
    userIds: string[], 
    taskTitle: string, 
    taskId: string, 
    projectId: string,
    completer?: { id: string; name: string; avatar?: string }
  ) {
    for (const userId of userIds) {
      await this.send({
        userId,
        type: 'task_completed',
        title: 'Task Completed',
        message: `Task "${taskTitle}" has been completed`,
        sender: completer,
        taskId,
        projectId
      })
    }
  }

  /**
   * Send comment notification
   */
  static async notifyComment(
    userIds: string[], 
    taskTitle: string, 
    taskId: string, 
    projectId: string,
    commenter?: { id: string; name: string; avatar?: string }
  ) {
    for (const userId of userIds) {
      await this.send({
        userId,
        type: 'comment',
        title: 'New Comment',
        message: `New comment on task "${taskTitle}"`,
        sender: commenter,
        taskId,
        projectId
      })
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    try {
      await dbConnect()
      await NotificationModel.updateOne(
        { _id: notificationId, userId },
        { $set: { isRead: true } }
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      await dbConnect()
      await NotificationModel.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true } }
      )
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  /**
   * Delete old notifications (older than 30 days)
   */
  static async cleanupOldNotifications() {
    try {
      await dbConnect()
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      await NotificationModel.deleteMany({
        time: { $lt: thirtyDaysAgo },
        isRead: true
      })
    } catch (error) {
      console.error('Failed to cleanup old notifications:', error)
    }
  }
}