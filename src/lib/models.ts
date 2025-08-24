import { Schema, model, models } from 'mongoose'

const UserRefSchema = new Schema({ id: String, name: String, avatar: String }, { _id: false })

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' },
  progress: { type: Number, default: 0 },
  dueDate: { type: Date },
  members: { type: [UserRefSchema], default: [] },
  tasksCount: { type: Number, default: 0 },
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
})
ActivitySchema.index({ time: -1 })

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
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } })

export const UserModel = models.User || model('User', UserSchema)
export const ProjectModel = models.Project || model('Project', ProjectSchema)
export const TaskModel = models.Task || model('Task', TaskSchema)
export const NotificationModel = models.Notification || model('Notification', NotificationSchema)
export const ActivityModel = models.Activity || model('Activity', ActivitySchema)
export const ChatMessageModel = models.ChatMessage || model('ChatMessage', ChatMessageSchema)