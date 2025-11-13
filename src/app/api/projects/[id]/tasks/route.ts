import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel } from '@/lib/models'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let { userId } = await auth()
  if (!userId) {
    const { getUserIdFromRequest } = await import('@/lib/serverAuth')
    userId = await getUserIdFromRequest(req)
  }
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  await dbConnect()
  const { id: projectId } = await params
  if (!isValidObjectId(projectId)) return new NextResponse('Invalid project ID', { status: 400 })

  // Check if user has permission to create tasks
  const project: any = await ProjectModel.findById(projectId).lean()
  if (!project) return new NextResponse('Project not found', { status: 404 })

  // Direct permission check - owner, leader, or co-leader can manage tasks
  const isOwner = project.ownerId === userId
  const member = project.members?.find((m: any) => m.id === userId)
  const canManage = isOwner || member?.role === 'leader' || member?.role === 'co-leader'
  
  if (!canManage) {
    return new NextResponse('Insufficient permissions', { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { title, description, priority = 'medium', assigneeId, dueDate } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  let assignee
  if (assigneeId && project.members) {
    const member = project.members.find((m: any) => m.id === assigneeId)
    if (member) {
      assignee = { id: member.id, name: member.name, avatar: member.avatar }
    }
  }

  const task: any = await TaskModel.create({
    projectId,
    title: title.trim(),
    description: description?.trim() || '',
    priority,
    assignee,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    creatorId: userId,
  })

  // Update task count
  await ProjectModel.findByIdAndUpdate(projectId, { $inc: { tasksCount: 1 } })

  const responseTask = {
    id: task._id.toString(),
    projectId: task.projectId.toString(),
    projectName: project.name,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString(),
    assignee: task.assignee,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    creatorId: task.creatorId,
  }

  return NextResponse.json(responseTask, { status: 201 })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let { userId } = await auth()
  if (!userId) {
    const { getUserIdFromRequest } = await import('@/lib/serverAuth')
    userId = await getUserIdFromRequest(req)
  }
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  await dbConnect()
  const { id: projectId } = await params
  if (!isValidObjectId(projectId)) return new NextResponse('Invalid project ID', { status: 400 })

  // Check if user has access to project
  const project: any = await ProjectModel.findById(projectId).lean()
  if (!project) return new NextResponse('Project not found', { status: 404 })

  // Direct permission check - if user is owner or member, they can view
  const isOwner = project.ownerId === userId
  const isMember = project.members?.some((m: any) => m.id === userId) || false
  
  if (!isOwner && !isMember) {
    return new NextResponse('Insufficient permissions', { status: 403 })
  }

  const tasks: any[] = await TaskModel.find({ projectId }).sort({ createdAt: -1 }).lean()
  
  const responseTasks = tasks.map(task => ({
    id: task._id.toString(),
    projectId: task.projectId.toString(),
    projectName: project.name,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate?.toISOString(),
    assignee: task.assignee,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    creatorId: task.creatorId,
  }))

  return NextResponse.json(responseTasks)
}