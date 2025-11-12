import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel } from '@/lib/models'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const { id } = await params
  if (!isValidObjectId(id)) return new NextResponse('Not found', { status: 404 })
  
  // Check if user is the owner (only owner can permanently delete)
  const project: any = await ProjectModel.findOne({ _id: id, ownerId: userId }).lean()
  if (!project) return new NextResponse('Not found or no permission', { status: 404 })
  
  // Permanently delete the project and all related data
  await Promise.all([
    ProjectModel.deleteOne({ _id: id }),
    TaskModel.deleteMany({ projectId: id }),
    // Add other related deletions here (files, messages, etc.)
  ])
  
  return NextResponse.json({ deleted: true })
}