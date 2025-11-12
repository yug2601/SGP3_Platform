import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel } from '@/lib/models'
import { getProjectPermissions } from '@/lib/permissions'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string, taskId: string }> }) {
  let { userId } = await auth()
  if (!userId) {
    const { getUserIdFromRequest } = await import('@/lib/serverAuth')
    userId = await getUserIdFromRequest(req)
  }
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  await dbConnect()
  const { id: projectId, taskId } = await params
  if (!isValidObjectId(projectId) || !isValidObjectId(taskId)) {
    return new NextResponse('Invalid ID', { status: 400 })
  }

  // Check permissions
  const project: any = await ProjectModel.findById(projectId).lean()
  if (!project) return new NextResponse('Project not found', { status: 404 })

  const permissions = getProjectPermissions(project, userId)
  if (!permissions.canManageTasks()) {
    return new NextResponse('Insufficient permissions', { status: 403 })
  }

  const task: any = await TaskModel.findOne({ _id: taskId, projectId }).lean()
  if (!task) return new NextResponse('Task not found', { status: 404 })

  const body = await req.json()
  const updates: any = {}

  // Only update provided fields
  if (body.title !== undefined) updates.title = body.title.trim()
  if (body.description !== undefined) updates.description = body.description?.trim() || ''
  if (body.status !== undefined) updates.status = body.status
  if (body.priority !== undefined) updates.priority = body.priority
  if (body.dueDate !== undefined) updates.dueDate = body.dueDate ? new Date(body.dueDate) : null

  // Handle assignee updates
  if (body.assignee !== undefined) {
    if (body.assignee === null || body.assignee === '') {
      updates.assignee = null
    } else {
      updates.assignee = body.assignee
    }
  }

  const updatedTask: any = await TaskModel.findByIdAndUpdate(taskId, updates, { new: true }).lean()

  const responseTask = {
    id: updatedTask._id.toString(),
    projectId: updatedTask.projectId.toString(),
    title: updatedTask.title,
    description: updatedTask.description,
    status: updatedTask.status,
    priority: updatedTask.priority,
    dueDate: updatedTask.dueDate?.toISOString(),
    assignee: updatedTask.assignee,
    createdAt: updatedTask.createdAt.toISOString(),
    updatedAt: updatedTask.updatedAt.toISOString(),
    creatorId: updatedTask.creatorId,
  }

  return NextResponse.json(responseTask)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string, taskId: string }> }) {
  let { userId } = await auth()
  if (!userId) {
    const { getUserIdFromRequest } = await import('@/lib/serverAuth')
    userId = await getUserIdFromRequest(req)
  }
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  await dbConnect()
  const { id: projectId, taskId } = await params
  if (!isValidObjectId(projectId) || !isValidObjectId(taskId)) {
    return new NextResponse('Invalid ID', { status: 400 })
  }

  // Check permissions
  const project: any = await ProjectModel.findById(projectId).lean()
  if (!project) return new NextResponse('Project not found', { status: 404 })

  const permissions = getProjectPermissions(project, userId)
  if (!permissions.canManageTasks()) {
    return new NextResponse('Insufficient permissions', { status: 403 })
  }

  const task: any = await TaskModel.findOne({ _id: taskId, projectId }).lean()
  if (!task) return new NextResponse('Task not found', { status: 404 })

  await TaskModel.findByIdAndDelete(taskId)
  
  // Update task count
  await ProjectModel.findByIdAndUpdate(projectId, { $inc: { tasksCount: -1 } })

  return NextResponse.json({ deleted: true })
}