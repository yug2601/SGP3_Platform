import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { Task } from '@/lib/types'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel, UserModel } from '@/lib/models'
import { NotificationService } from '@/lib/notification-service'

function mapTask(t: any): Task {
  return {
    id: t._id.toString(),
    projectId: t.projectId.toString(),
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
    assignee: t.assignee || undefined,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    creatorId: t.creatorId,
  }
}

export async function GET(req: Request) {
  // Prefer middleware context; fallback to bearer verification (dev-friendly)
  let { userId } = await auth()
  if (!userId) {
    const { getUserIdFromRequest } = await import('@/lib/serverAuth')
    userId = await getUserIdFromRequest(req)
  }
  if (!userId) {
    if (process.env.NODE_ENV !== 'production') {
      const hdr = Object.fromEntries(req.headers.entries())
      return NextResponse.json({ error: 'Unauthorized', debug: { hasCookie: !!hdr.cookie, hasAuthz: !!hdr.authorization } }, { status: 401 })
    }
    return new NextResponse('Unauthorized', { status: 401 })
  }
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const projectIdParam = searchParams.get('projectId') || undefined

  // Build visibility: projects where user is owner or member
  const visibleProjects = await ProjectModel.find({
    $or: [{ ownerId: userId }, { 'members.id': userId }],
  }).select('_id').lean()
  const visibleIds = visibleProjects.map((p: any) => p._id)

  let query: any
  if (projectIdParam) {
    // tasks for a specific project (ensure visibility)
    query = { $and: [ { projectId: { $in: visibleIds } }, { projectId: projectIdParam } ] }
  } else {
    // personal tasks: created by me or assigned to me across visible projects
    query = {
      projectId: { $in: visibleIds },
      $or: [
        { creatorId: userId },
        { 'assignee.id': userId },
      ],
    }
  }

  const items = await TaskModel.find(query).sort({ updatedAt: -1 }).lean()
  return NextResponse.json(items.map(mapTask))
}

import { taskCreateSchema } from '@/lib/validation'

export async function POST(req: Request) {
  // Prefer middleware context; fallback to bearer verification (dev-friendly)
  let { userId } = await auth()
  if (!userId) {
    const { getUserIdFromRequest } = await import('@/lib/serverAuth')
    userId = await getUserIdFromRequest(req)
  }
  if (!userId) {
    if (process.env.NODE_ENV !== 'production') {
      const hdr = Object.fromEntries(req.headers.entries())
      return NextResponse.json({ error: 'Unauthorized', debug: { hasCookie: !!hdr.cookie, hasAuthz: !!hdr.authorization } }, { status: 401 })
    }
    return new NextResponse('Unauthorized', { status: 401 })
  }
  const json = await req.json().catch(() => null)
  const parsed = taskCreateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 })
  const { projectId, title, description, status, priority, dueDate, assignee } = parsed.data

  await dbConnect()
  const project = await ProjectModel.findOne({ _id: projectId, ownerId: userId }).lean()
  if (!project) return new NextResponse('Project not found', { status: 404 })

  const createdDoc = await TaskModel.create({
    projectId,
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    assignee,
    creatorId: userId,
  })
  await ProjectModel.updateOne({ _id: projectId }, { $inc: { tasksCount: 1 } })
  
  // Get current user info for notifications
  const currentUser = await UserModel.findOne({ clerkId: userId }).lean()
  const userRef = currentUser ? {
    id: (currentUser as any).clerkId,
    name: (currentUser as any).name || 'Unknown User',
    avatar: (currentUser as any).imageUrl
  } : { id: userId, name: 'Unknown User' }
  
  // Log task creation activity
  try {
    const { ActivityLogger } = await import('@/lib/activity-logger')
    await ActivityLogger.logTask('created', title, createdDoc._id.toString(), projectId, userId)
  } catch (error) {
    console.error('Failed to log task creation activity:', error)
  }
  
  // Send notification if task is assigned to someone other than creator
  try {
    if (assignee && assignee.id && assignee.id !== userId) {
      await NotificationService.notifyTaskAssignment(
        assignee.id,
        title,
        createdDoc._id.toString(),
        projectId,
        userRef
      )
    }
  } catch (error) {
    console.error('Failed to send task assignment notification:', error)
  }
  // recompute project progress lazily
  try {
    const total = await TaskModel.countDocuments({ projectId })
    const done = await TaskModel.countDocuments({ projectId, status: 'done' })
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    await ProjectModel.updateOne({ _id: projectId }, { $set: { progress } })
  } catch {}
  return NextResponse.json(mapTask(createdDoc.toObject()), { status: 201 })
}