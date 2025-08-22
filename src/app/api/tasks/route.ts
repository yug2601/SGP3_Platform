import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { Task } from '@/lib/types'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel } from '@/lib/models'

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

  // Only tasks from projects owned by this user
  const ownedProjects = await ProjectModel.find({ ownerId: userId }).select('_id').lean()
  const ownedIds = ownedProjects.map((p: any) => p._id)

  const query: any = { projectId: { $in: ownedIds } }
  if (projectIdParam) query.projectId = projectIdParam

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
  return NextResponse.json(mapTask(createdDoc.toObject()), { status: 201 })
}