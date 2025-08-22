import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel } from '@/lib/models'

function map(t: any) {
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  const patch = await req.json()
  await dbConnect()
  // ensure task belongs to user's project
  const task: any = await TaskModel.findById(resolvedParams.id).lean()
  if (!task) return new NextResponse('Not found', { status: 404 })
  const project = await ProjectModel.findOne({ _id: task.projectId, ownerId: userId }).select('_id').lean()
  if (!project) return new NextResponse('Not found', { status: 404 })

  const updates: any = { ...patch }
  if (typeof updates.dueDate === 'string') updates.dueDate = new Date(updates.dueDate)
  const updated = await TaskModel.findByIdAndUpdate(resolvedParams.id, { $set: updates }, { new: true }).lean()
  if (!updated) return new NextResponse('Not found', { status: 404 })
  return NextResponse.json(map(updated))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  await dbConnect()
  const task: any = await TaskModel.findById(resolvedParams.id).lean()
  if (!task) return new NextResponse('Not found', { status: 404 })
  const project = await ProjectModel.findOne({ _id: task.projectId, ownerId: userId }).select('_id').lean()
  if (!project) return new NextResponse('Not found', { status: 404 })
  await TaskModel.deleteOne({ _id: resolvedParams.id })
  await ProjectModel.updateOne({ _id: task.projectId }, { $inc: { tasksCount: -1 } })
  return new NextResponse(null, { status: 204 })
}