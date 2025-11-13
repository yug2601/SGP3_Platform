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
  
  console.log('Auth check for delete:', { userId, hasUserId: !!userId })
  
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
  
  // Find the project first
  const project: any = await ProjectModel.findById(id).lean()
  if (!project) return new NextResponse('Project not found', { status: 404 })
  
  // Check if user can delete the project (owner, leader, co-leader, or member without role)
  const isOwner = project.ownerId === userId
  const member = project.members?.find((m: any) => m.id === userId)
  // Allow deletion if: owner, has leader/co-leader role, or is member without role (legacy support)
  const canDelete = isOwner || member?.role === 'leader' || member?.role === 'co-leader' || (member && !member.role)
  
  console.log('Delete permission check:', {
    projectId: id,
    userId: userId,
    projectOwnerId: project.ownerId,
    isOwner,
    member,
    canDelete
  })
  
  if (!canDelete) {
    return new NextResponse(`Insufficient permissions to delete project. Only project owner or leaders can delete.`, { status: 403 })
  }
  
  // Permanently delete the project and all related data
  const { ProjectFileModel, ChatMessageModel } = await import('@/lib/models')
  await Promise.all([
    ProjectModel.deleteOne({ _id: id }),
    TaskModel.deleteMany({ projectId: id }),
    ProjectFileModel.deleteMany({ projectId: id }),
    ChatMessageModel.deleteMany({ projectId: id }),
  ])
  
  return NextResponse.json({ deleted: true })
}