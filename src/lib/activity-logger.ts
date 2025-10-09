import { dbConnect } from '@/lib/db'
import { ActivityModel, UserModel } from '@/lib/models'
import { currentUser } from '@clerk/nextjs/server'

export interface ActivityLogData {
  type: string
  message: string
  userId?: string
  projectId?: string
  taskId?: string
  metadata?: any
}

export class ActivityLogger {
  /**
   * Log a user activity with comprehensive tracking
   */
  static async log(data: ActivityLogData) {
    try {
      await dbConnect()
      
      // Get user info if not provided
      let userId = data.userId
      let user = null
      
      if (!userId) {
        const clerkUser = await currentUser()
        if (clerkUser) {
          userId = clerkUser.id
          user = {
            id: clerkUser.id,
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || 
                  clerkUser.username || 
                  clerkUser.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 
                  'User',
            avatar: clerkUser.imageUrl
          }
        }
      }
      
      if (!userId) return // No authenticated user
      
      // Get user info from database if not from clerk
      if (!user) {
        const dbUser = await UserModel.findOne({ clerkId: userId }).lean()
        if (dbUser && typeof dbUser === 'object' && !Array.isArray(dbUser)) {
          user = {
            id: userId,
            name: (dbUser as any).name || 'User',
            avatar: (dbUser as any).imageUrl || ''
          }
        } else {
          user = { id: userId, name: 'User', avatar: '' }
        }
      }
      
      const activity = new ActivityModel({
        type: data.type,
        message: data.message,
        userId,
        user,
        projectId: data.projectId || undefined,
        taskId: data.taskId || undefined,
        metadata: data.metadata || {},
        time: new Date()
      })
      
      await activity.save()
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  /**
   * Log project-related activities
   */
  static async logProject(action: string, projectName: string, projectId: string, userId?: string) {
    const messages = {
      created: `Created project "${projectName}"`,
      updated: `Updated project "${projectName}"`,
      deleted: `Deleted project "${projectName}"`,
      joined: `Joined project "${projectName}"`,
      left: `Left project "${projectName}"`,
      completed: `Completed project "${projectName}"`
    }
    
    await this.log({
      type: `project_${action}`,
      message: messages[action as keyof typeof messages] || `${action} project "${projectName}"`,
      projectId,
      userId,
      metadata: { action, projectName }
    })
  }

  /**
   * Log task-related activities
   */
  static async logTask(action: string, taskTitle: string, taskId: string, projectId?: string, userId?: string) {
    const messages = {
      created: `Created task "${taskTitle}"`,
      updated: `Updated task "${taskTitle}"`,
      completed: `Completed task "${taskTitle}"`,
      deleted: `Deleted task "${taskTitle}"`,
      assigned: `Assigned task "${taskTitle}"`,
      commented: `Commented on task "${taskTitle}"`
    }
    
    await this.log({
      type: `task_${action}`,
      message: messages[action as keyof typeof messages] || `${action} task "${taskTitle}"`,
      projectId,
      taskId,
      userId,
      metadata: { action, taskTitle }
    })
  }

  /**
   * Log user authentication activities
   */
  static async logAuth(action: string, userId?: string) {
    const messages = {
      login: 'Signed in to TogetherFlow',
      logout: 'Signed out from TogetherFlow',
      register: 'Joined TogetherFlow'
    }
    
    await this.log({
      type: `auth_${action}`,
      message: messages[action as keyof typeof messages] || `User ${action}`,
      userId,
      metadata: { action }
    })
  }

  /**
   * Log general user activities
   */
  static async logGeneral(action: string, description: string, userId?: string, metadata?: any) {
    await this.log({
      type: `general_${action}`,
      message: description,
      userId,
      metadata: metadata || {}
    })
  }
}