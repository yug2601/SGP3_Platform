import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, TaskModel, ActivityModel, UserModel } from '@/lib/models'
import { NotificationService } from '@/lib/notification-service'

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
  const patch = await req.json().catch(() => ({}))
  await dbConnect()
  // ensure task belongs to user's project
  const task: any = await TaskModel.findById(resolvedParams.id).lean()
  if (!task) return new NextResponse('Not found', { status: 404 })
  const project = await ProjectModel.findOne({ _id: task.projectId, ownerId: userId }).select('_id').lean()
  if (!project) return new NextResponse('Not found', { status: 404 })

  const updates: any = { ...patch }
  if (typeof updates.dueDate === 'string') updates.dueDate = new Date(updates.dueDate)
  const updated: any = await TaskModel.findByIdAndUpdate(resolvedParams.id, { $set: updates }, { new: true }).lean()
  if (!updated) return new NextResponse('Not found', { status: 404 })
  
  // Get current user info for notifications
  const currentUser = await UserModel.findOne({ clerkId: userId }).lean()
  const userRef = currentUser ? {
    id: (currentUser as any).clerkId,
    name: (currentUser as any).name || 'Unknown User',
    avatar: (currentUser as any).imageUrl
  } : { id: userId, name: 'Unknown User' }
  
  // record activity for status/assignee change and send notifications
  try {
    if (typeof updates.status === 'string') {
      await ActivityModel.create({ 
        type: 'task_updated', 
        message: `Task "${updated.title}" marked ${updates.status}`, 
        user: userRef, 
        userId: userId,
        projectId: updated.projectId,
        taskId: updated._id
      })
      
      // Send notification for task completion
      if (updates.status === 'done') {
        const projectDoc = await ProjectModel.findById(updated.projectId).lean()
        if (projectDoc) {
          // Notify all project members about task completion
          const memberIds = ((projectDoc as any).members || [])
            .map((m: any) => m.id)
            .filter((id: string) => id !== userId) // Don't notify the person who completed it
          
          if (memberIds.length > 0) {
            await NotificationService.notifyTaskCompletion(
              memberIds,
              updated.title,
              updated._id.toString(),
              updated.projectId.toString(),
              userRef
            )
          }
        }
      }
    }
    
    if (updates.assignee?.id && updates.assignee.id !== userId) {
      await ActivityModel.create({ 
        type: 'task_updated', 
        message: `Task "${updated.title}" assigned to ${updates.assignee.name}`, 
        user: userRef, 
        userId: userId,
        projectId: updated.projectId,
        taskId: updated._id
      })
      
      // Send notification to the assignee
      await NotificationService.notifyTaskAssignment(
        updates.assignee.id,
        updated.title,
        updated._id.toString(),
        updated.projectId.toString(),
        userRef
      )
    }
  } catch (error) {
    console.error('Error recording activity or sending notifications:', error)
  }
  // recompute project progress lazily after update
  try {
    const total = await TaskModel.countDocuments({ projectId: updated.projectId })
    const done = await TaskModel.countDocuments({ projectId: updated.projectId, status: 'done' })
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    await ProjectModel.updateOne({ _id: updated.projectId }, { $set: { progress } })
  } catch {}
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
  // recompute project progress lazily after delete
  try {
    const total = await TaskModel.countDocuments({ projectId: task.projectId })
    const done = await TaskModel.countDocuments({ projectId: task.projectId, status: 'done' })
    const progress = total > 0 ? Math.round((done / total) * 100) : 0
    await ProjectModel.updateOne({ _id: task.projectId }, { $set: { progress } })
  } catch {}
  return new NextResponse(null, { status: 204 })
}