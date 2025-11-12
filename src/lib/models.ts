import { Schema, model, models } from 'mongoose'

const UserRefSchema = new Schema({ id: String, name: String, avatar: String }, { _id: false })

const ProjectMemberSchema = new Schema({ 
  id: String, 
  name: String, 
  avatar: String,
  role: { type: String, enum: ['leader', 'co-leader', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false })

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' },
  progress: { type: Number, default: 0 },
  dueDate: { type: Date },
  members: { type: [ProjectMemberSchema], default: [] },
  tasksCount: { type: Number, default: 0 },
  filesCount: { type: Number, default: 0 },
  ownerId: { type: String, required: true },
  archived: { type: Boolean, default: false },
  inviteCode: { type: String },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })
ProjectSchema.index({ ownerId: 1, updatedAt: -1 })
ProjectSchema.index({ inviteCode: 1 }, { unique: false, sparse: true })

const TaskSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: Date,
  assignee: UserRefSchema,
  creatorId: { type: String, required: true },
}, { timestamps: true })
TaskSchema.index({ projectId: 1, updatedAt: -1 })

const NotificationSchema = new Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  time: { type: Date, default: Date.now },
  sender: UserRefSchema,
})
NotificationSchema.index({ userId: 1, time: -1 })

const ActivitySchema = new Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
  user: UserRefSchema,
  userId: { type: String, required: true }, // Always track which user performed the action
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  metadata: { type: Schema.Types.Mixed }, // Store additional contextual data
})
ActivitySchema.index({ time: -1 })
ActivitySchema.index({ userId: 1, time: -1 }) // User-specific activity lookup
ActivitySchema.index({ projectId: 1, time: -1 })

const ChatMessageSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  content: { type: String, required: true },
  sender: UserRefSchema,
  timestamp: { type: Date, default: Date.now },
})
ChatMessageSchema.index({ projectId: 1, timestamp: 1 })

// User model to persist Clerk-linked application users
const UserSchema = new Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, index: true, sparse: true, unique: true },
  name: { type: String },
  imageUrl: { type: String },
  roles: { type: [String], default: ['member'] },
  // Personal Information
  bio: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  // Preferences
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  timezone: { type: String, default: 'UTC' },
  // Notification Preferences
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: false },
    weeklyDigest: { type: Boolean, default: true },
    projectUpdates: { type: Boolean, default: true },
    taskReminders: { type: Boolean, default: true },
    teamInvites: { type: Boolean, default: true }
  },
  // Statistics
  stats: {
    projectsCreated: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 },
    teamCollaborations: { type: Number, default: 0 },
    messagesSent: { type: Number, default: 0 }
  }
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

const ProjectFileSchema = new Schema({
  projectId: { type: String, required: true },
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadedBy: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: String
  },
  uploadedAt: { type: String, required: true },
  url: { type: String, required: true },
  fileKey: { type: String, required: true }
})

export const UserModel = models.User || model('User', UserSchema)
export const ProjectModel = models.Project || model('Project', ProjectSchema)
export const TaskModel = models.Task || model('Task', TaskSchema)
export const NotificationModel = models.Notification || model('Notification', NotificationSchema)
export const ActivityModel = models.Activity || model('Activity', ActivitySchema)
export const ChatMessageModel = models.ChatMessage || model('ChatMessage', ChatMessageSchema)
export const ProjectFileModel = models.ProjectFile || model('ProjectFile', ProjectFileSchema)