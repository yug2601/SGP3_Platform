import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel, NotificationModel, ActivityModel, ChatMessageModel } from '@/lib/models'

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Forbidden in production', { status: 403 })
  }

  await dbConnect()

  await Promise.all([
    TaskModel.deleteMany({}),
    ProjectModel.deleteMany({}),
    NotificationModel.deleteMany({}),
    ActivityModel.deleteMany({}),
    ChatMessageModel.deleteMany({}),
  ])

  const { userId } = await auth()
  const ownerId = userId || 'demo-user'
  const ownerName = userId ? 'You' : 'Demo User'

  const projects = await ProjectModel.insertMany([
    { name: 'Alpha', description: 'First project', status: 'active', progress: 35, ownerId },
    { name: 'Beta', description: 'Second project', status: 'on-hold', progress: 10, ownerId },
    { name: 'Gamma', description: 'Third project', status: 'completed', progress: 100, ownerId },
  ])

  const tasks = await TaskModel.insertMany([
    { projectId: projects[0]._id, title: 'Design wireframes', status: 'in-progress', priority: 'high', creatorId: ownerId },
    { projectId: projects[0]._id, title: 'Set up CI', status: 'todo', priority: 'medium', creatorId: ownerId },
    { projectId: projects[1]._id, title: 'Plan sprint', status: 'todo', priority: 'low', creatorId: ownerId },
  ])

  await ProjectModel.updateOne({ _id: projects[0]._id }, { $set: { tasksCount: 2 } })
  await ProjectModel.updateOne({ _id: projects[1]._id }, { $set: { tasksCount: 1 } })

  await NotificationModel.insertMany([
    { userId: ownerId, type: 'project_update', title: 'Project Alpha Updated', message: 'Progress increased to 35%' },
    { userId: ownerId, type: 'task_assigned', title: 'New Task', message: 'You were assigned: Design wireframes' },
  ])

  await ActivityModel.insertMany([
    { type: 'project_created', message: 'Project Alpha created', user: { id: ownerId, name: ownerName } },
    { type: 'task_created', message: 'Design wireframes created', user: { id: ownerId, name: ownerName } },
  ])

  await ChatMessageModel.insertMany([
    { projectId: projects[0]._id, content: 'Welcome to Alpha!', sender: { id: ownerId, name: ownerName } },
    { projectId: projects[0]._id, content: 'Kickoff meeting tomorrow.', sender: { id: ownerId, name: ownerName } },
  ])

  return NextResponse.json({
    projects: projects.map(p => p._id.toString()),
    tasks: tasks.map(t => t._id.toString()),
  })
}