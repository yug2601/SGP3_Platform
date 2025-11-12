import { auth, getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel } from '@/lib/models'

export async function GET(req: Request) {
  // Try request-scoped auth first, then global, then manual verify
  let { userId } = getAuth(req as any)
  if (!userId) ({ userId } = await auth())
  if (!userId) userId = await (await import('@/lib/serverAuth')).getUserIdFromRequest(req)
  if (!userId) {
    if (process.env.NODE_ENV !== 'production') {
      const hdr = Object.fromEntries(req.headers.entries())
      return NextResponse.json({ error: 'Unauthorized', debug: { hasCookie: !!hdr.cookie, hasAuthz: !!hdr.authorization } }, { status: 401 })
    }
    return new NextResponse('Unauthorized', { status: 401 })
  }

  await dbConnect()
  const items = await ProjectModel.find({
    archived: true,
    $or: [
      { ownerId: userId },
      { 'members.id': userId },
    ],
  }).sort({ updatedAt: -1 }).lean()
  
  const mapped = items.map((p: any) => ({
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
    archived: !!p.archived,
    inviteCode: p.inviteCode || undefined,
  }))
  
  return NextResponse.json(mapped)
}