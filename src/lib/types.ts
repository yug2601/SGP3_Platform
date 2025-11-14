export type ID = string

export type ProjectStatus = 'active' | 'completed' | 'on-hold'
export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'
export type ProjectRole = 'leader' | 'co-leader' | 'member'

export interface UserRef {
  id: string
  name: string
  avatar?: string
}

export interface ProjectMember extends UserRef {
  role: ProjectRole
  joinedAt: string // ISO date
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
  members: ProjectMember[]
  tasksCount: number
  filesCount: number
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
  archived?: boolean
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

// Extended Analytics Types
export interface AnalyticsTimeframe {
  label: string
  value: '24h' | '7d' | '30d' | '90d' | '1y'
}

export interface AnalyticsMetric {
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

export interface ActivityDataPoint {
  timestamp: string
  value: number
  label?: string
}

export interface TaskAnalytics {
  totalTasks: AnalyticsMetric
  completedTasks: AnalyticsMetric
  inProgressTasks: AnalyticsMetric
  overdueTask: AnalyticsMetric
  completionRate: AnalyticsMetric
  avgCompletionTime: AnalyticsMetric
  tasksByStatus: { status: string; count: number; percentage: number }[]
  tasksByPriority: { priority: string; count: number; percentage: number }[]
  dailyActivity: ActivityDataPoint[]
  weeklyTrend: ActivityDataPoint[]
}

export interface ProjectAnalytics {
  totalProjects: AnalyticsMetric
  activeProjects: AnalyticsMetric
  completedProjects: AnalyticsMetric
  projectsByStatus: { status: string; count: number; percentage: number }[]
  teamProductivity: ActivityDataPoint[]
  resourceAllocation: { name: string; value: number; color: string }[]
}

export interface UserAnalytics {
  activeUsers: AnalyticsMetric
  newUsers: AnalyticsMetric
  userRetention: AnalyticsMetric
  userEngagement: AnalyticsMetric
  userActivity: ActivityDataPoint[]
  usersByRole: { role: string; count: number; percentage: number }[]
  topContributors: { id: string; name: string; contributions: number; avatar?: string }[]
}

export interface SystemAnalytics {
  responseTime: AnalyticsMetric
  uptime: AnalyticsMetric
  errorRate: AnalyticsMetric
  apiCalls: AnalyticsMetric
  storageUsed: AnalyticsMetric
  performanceMetrics: ActivityDataPoint[]
  errorsByType: { type: string; count: number; percentage: number }[]
}

export interface CollaborationAnalytics {
  totalMessages: AnalyticsMetric
  activeChats: AnalyticsMetric
  fileShares: AnalyticsMetric
  meetingsHeld: AnalyticsMetric
  communicationTrend: ActivityDataPoint[]
  channelActivity: { channel: string; messages: number; users: number }[]
}

export interface FinancialAnalytics {
  revenue: AnalyticsMetric
  expenses: AnalyticsMetric
  profit: AnalyticsMetric
  budgetUtilization: AnalyticsMetric
  revenueByProject: { project: string; revenue: number; percentage: number }[]
  expensesByCategory: { category: string; amount: number; percentage: number }[]
  monthlyTrend: ActivityDataPoint[]
}

export interface DashboardAnalytics {
  overview: {
    totalUsers: number
    totalProjects: number
    totalTasks: number
    revenue: number
  }
  tasks: TaskAnalytics
  projects: ProjectAnalytics
  users: UserAnalytics
  system: SystemAnalytics
  collaboration: CollaborationAnalytics
  financial?: FinancialAnalytics
  lastUpdated: string
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

export interface ProjectFile {
  id: string
  projectId: string
  name: string
  originalName: string
  size: number // in bytes
  mimeType: string
  uploadedBy: UserRef
  uploadedAt: string // ISO date
  url: string
  fileKey: string // For cloud storage identification
  fileBuffer?: string // Base64 encoded file data (optional for backward compatibility)
}

export interface PersonalMetric {
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

export interface PersonalAnalyticsData {
  tasks: {
    totalTasks: PersonalMetric
    completedTasks: PersonalMetric
    pendingTasks: PersonalMetric
    overdueTask: PersonalMetric
    completionRate: PersonalMetric
    avgCompletionTime: PersonalMetric
    dailyActivity: Array<{
      date: string
      completed: number
      created: number
      label: string
      timestamp: string
      value: number
    }>
    tasksByPriority: Array<{
      priority: string
      count: number
      percentage: number
      color: string
    }>
    tasksByStatus: Array<{
      status: string
      count: number
      percentage: number
      color: string
    }>
    weeklyTrend: Array<{
      week: string
      completed: number
      created: number
    }>
  }
  projects: {
    totalProjects: PersonalMetric
    activeProjects: PersonalMetric
    completedProjects: PersonalMetric
    ownedProjects: PersonalMetric
    projectsByStatus: Array<{
      status: string
      count: number
      color: string
    }>
    teamContributions: Array<{
      id: string
      name: string
      contributions: number
      avatar?: string
    }>
    productivity: Array<{
      date: string
      productivity: number
      label: string
      timestamp: string
      value: number
    }>
  }
  collaboration: {
    totalMessages: PersonalMetric
    activeChats: PersonalMetric
    fileShares: PersonalMetric
    teamInteractions: PersonalMetric
    communicationTrend: Array<{
      date: string
      messages: number
      reactions: number
      label: string
      timestamp: string
      value: number
    }>
    topChannels: Array<{
      id: string
      type: string
      description: string
      timestamp: string
    }>
  }
  activity: {
    loginStreak: PersonalMetric
    timeSpent: PersonalMetric
    peakActivityHour: string
    activityByDay: Array<{
      name: string
      value: number
      color: string
    }>
    recentActivities: Array<{
      id: string
      type: string
      description: string
      timestamp: string
    }>
  }
}