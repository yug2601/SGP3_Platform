export type ID = string

export type ProjectStatus = 'active' | 'completed' | 'on-hold'
export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface UserRef {
  id: string
  name: string
  avatar?: string
}

export interface Project {
  id: ID
  name: string
  description: string
  status: ProjectStatus
  progress: number // 0-100
  dueDate?: string // ISO string
  createdAt: string // ISO
  updatedAt: string // ISO
  members: UserRef[]
  tasksCount: number
  ownerId: string // Clerk user id
  archived?: boolean
  inviteCode?: string
}

export interface Task {
  id: ID
  projectId: ID
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string // ISO
  assignee?: UserRef
  createdAt: string
  updatedAt: string
  creatorId: string // Clerk user id
}

export type NotificationType =
  | 'comment'
  | 'task_assigned'
  | 'project_update'
  | 'team_invite'
  | 'deadline'
  | 'task_completed'

export interface Notification {
  id: ID
  userId: string // notification receiver (Clerk user)
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  time: string // ISO
  sender?: UserRef
}

export interface ActivityItem {
  id: ID
  type:
    | 'task_created'
    | 'task_updated'
    | 'task_completed'
    | 'project_created'
    | 'project_updated'
    | 'comment_added'
    | 'member_added'
  message: string
  time: string // ISO
  user: UserRef
}

export interface ChatMessageItem {
  id: ID
  projectId: ID
  content: string
  sender: UserRef
  timestamp: string // ISO
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  timezone: string
}

export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyDigest: boolean
  projectUpdates: boolean
  taskReminders: boolean
  teamInvites: boolean
}

export interface UserStats {
  projectsCreated: number
  tasksCompleted: number
  teamCollaborations: number
  messagesSent: number
}

export interface UserProfile {
  id: ID
  clerkId: string
  email?: string
  name?: string
  imageUrl?: string
  bio?: string
  firstName?: string
  lastName?: string
  preferences: UserPreferences
  notificationSettings: NotificationSettings
  stats: UserStats
  createdAt: string
  updatedAt: string
}