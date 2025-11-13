export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, ActivityModel } from '@/lib/models'
import { getProjectPermissions } from '@/lib/permissions'

// Update member role
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  
  const body = await req.json().catch(() => null)
  const { memberId, role } = body
  
  if (!memberId || !role || !['leader', 'co-leader', 'member'].includes(role)) {
    return NextResponse.json({ error: 'Invalid memberId or role' }, { status: 400 })
  }

  await dbConnect()
  const { id } = await ctx.params
  const project: any = await ProjectModel.findOne({ _id: id }).lean()
  if (!project) return new NextResponse('Not found', { status: 404 })

  // Check permissions
  const permissions = getProjectPermissions(project, userId)
  if (!permissions.canAssignRoles()) {
    return new NextResponse('Insufficient permissions - only leaders can assign roles', { status: 403 })
  }

  // Don't allow changing the owner's role
  if (project.ownerId === memberId) {
    return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
  }

  // Update the member's role
  const result = await ProjectModel.updateOne(
    { _id: id, 'members.id': memberId },
    { $set: { 'members.$.role': role } }
  )

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Log activity
  try {
    const member = project.members?.find((m: any) => m.id === memberId)
    if (member) {
      await ActivityModel.create({
        type: 'member_role_updated',
        message: `${member.name} role updated to ${role}`,
        user: { id: userId, name: 'Project Leader' },
        projectId: id as any,
        userId
      })
    }
  } catch (error) {
    console.error('Failed to log role update activity:', error)
  }

  return NextResponse.json({ success: true })
}

// Remove member from project
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  
  const body = await req.json().catch(() => null)
  const { memberId } = body
  
  if (!memberId) {
    return NextResponse.json({ error: 'memberId is required' }, { status: 400 })
  }

  await dbConnect()
  const { id } = await ctx.params
  const project: any = await ProjectModel.findOne({ _id: id }).lean()
  if (!project) return new NextResponse('Not found', { status: 404 })

  // Check permissions
  const permissions = getProjectPermissions(project, userId)
  if (!permissions.canAddRemoveMembers()) {
    return new NextResponse('Insufficient permissions - only leaders and co-leaders can remove members', { status: 403 })
  }

  // Don't allow removing the owner
  if (project.ownerId === memberId) {
    return NextResponse.json({ error: 'Cannot remove project owner' }, { status: 400 })
  }

  // Don't allow co-leaders to remove other co-leaders or leaders (except themselves)
  if (permissions.isCoLeader() && memberId !== userId) {
    const targetMember = project.members?.find((m: any) => m.id === memberId)
    if (targetMember && (targetMember.role === 'leader' || targetMember.role === 'co-leader')) {
      return new NextResponse('Co-leaders cannot remove other leaders or co-leaders', { status: 403 })
    }
  }

  // Remove the member
  const result = await ProjectModel.updateOne(
    { _id: id },
    { $pull: { members: { id: memberId } } }
  )

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Log activity
  try {
    const member = project.members?.find((m: any) => m.id === memberId)
    if (member) {
      await ActivityModel.create({
        type: 'member_removed',
        message: `${member.name} was removed from the project`,
        user: { id: userId, name: 'Project Manager' },
        projectId: id as any,
        userId
      })
    }
  } catch (error) {
    console.error('Failed to log member removal activity:', error)
  }

  return NextResponse.json({ success: true })
}