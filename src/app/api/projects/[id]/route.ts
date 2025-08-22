import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel, ChatMessageModel } from '@/lib/models'

export async function GET(req: Request, { params }: { params: { id: string } }) {
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
  //error here
  await dbConnect()
  const p: any = await ProjectModel.findOne({ _id: params.id, ownerId: userId }).lean()
  if (!p) return new NextResponse('Not found', { status: 404 })
  return NextResponse.json({
//till here
    id: p._id.toString(),
    name: p.name,
    description: p.description,
    status: p.status,
    progress: p.progress,
    dueDate: p.dueDate ? p.dueDate.toISOString() : undefined,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    members: p.members || [],
    tasksCount: p.tasksCount || 0,
    ownerId: p.ownerId,
  })
}

import { projectPatchSchema } from '@/lib/validation'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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
  const json = await req.json().catch(() => null)
  const parsed = projectPatchSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 })
  const patch = parsed.data
  const updates: any = { ...patch }
  if (typeof updates.dueDate === 'string') updates.dueDate = new Date(updates.dueDate)

  const updated: any = await ProjectModel.findOneAndUpdate(
    { _id: params.id, ownerId: userId },
    { $set: updates },
    { new: true }
  ).lean()
  if (!updated) return new NextResponse('Not found', { status: 404 })
  return NextResponse.json({
    id: updated._id.toString(),
    name: updated.name,
    description: updated.description,
    status: updated.status,
    progress: updated.progress,
    dueDate: updated.dueDate ? updated.dueDate.toISOString() : undefined,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    members: updated.members || [],
    tasksCount: updated.tasksCount || 0,
    ownerId: updated.ownerId,
  })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
  // delete tasks + chat for the project, then project
  await TaskModel.deleteMany({ projectId: params.id as any })
  await ChatMessageModel.deleteMany({ projectId: params.id as any })
  const res = await ProjectModel.deleteOne({ _id: params.id, ownerId: userId })
  if (!res.deletedCount) return new NextResponse('Not found', { status: 404 })
  return new NextResponse(null, { status: 204 })
}