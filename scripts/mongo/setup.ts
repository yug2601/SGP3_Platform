/* eslint-disable no-console */
import mongoose from 'mongoose'
import path from 'path'
import dotenv from 'dotenv'

async function main() {
  // Load env from project .env.local for local runs
  dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') })

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI not set in .env.local')
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB,
    serverSelectionTimeoutMS: 8000,
  })

  const conn = mongoose.connection

  // Define minimal schemas here to ensure collections + indexes exist in Atlas
  const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, index: true, sparse: true, unique: true },
    name: String,
    imageUrl: String,
    roles: { type: [String], default: ['member'] },
  }, { timestamps: true })

  const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' },
    progress: { type: Number, default: 0 },
    dueDate: { type: Date },
    members: [{ id: String, name: String, avatar: String }],
    tasksCount: { type: Number, default: 0 },
    ownerId: { type: String, required: true },
  }, { timestamps: true })
  projectSchema.index({ ownerId: 1, updatedAt: -1 })

  const taskSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    description: String,
    status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: Date,
    assignee: { id: String, name: String, avatar: String },
    creatorId: { type: String, required: true },
  }, { timestamps: true })
  taskSchema.index({ projectId: 1, updatedAt: -1 })

  const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    time: { type: Date, default: Date.now },
    sender: { id: String, name: String, avatar: String },
  })
  notificationSchema.index({ userId: 1, time: -1 })

  const activitySchema = new mongoose.Schema({
    type: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: Date, default: Date.now },
    user: { id: String, name: String, avatar: String },
  })
  activitySchema.index({ time: -1 })

  const chatSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    content: { type: String, required: true },
    sender: { id: String, name: String, avatar: String },
    timestamp: { type: Date, default: Date.now },
  })
  chatSchema.index({ projectId: 1, timestamp: 1 })

  const User = conn.models.User || conn.model('User', userSchema)
  const Project = conn.models.Project || conn.model('Project', projectSchema)
  const Task = conn.models.Task || conn.model('Task', taskSchema)
  const Notification = conn.models.Notification || conn.model('Notification', notificationSchema)
  const Activity = conn.models.Activity || conn.model('Activity', activitySchema)
  const ChatMessage = conn.models.ChatMessage || conn.model('ChatMessage', chatSchema)

  // Touch collections to ensure creation and indexes
  await Promise.all([
    User.init(),
    Project.init(),
    Task.init(),
    Notification.init(),
    Activity.init(),
    ChatMessage.init(),
  ])

  console.log('Mongo setup complete: collections and indexes ensured')
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})