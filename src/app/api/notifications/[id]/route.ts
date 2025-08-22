import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { NotificationModel } from '@/lib/models'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  await dbConnect()
  const n: any = await NotificationModel.findOneAndUpdate({ _id: resolvedParams.id, userId }, { $set: { isRead: true } }, { new: true }).lean()
  if (!n) return new NextResponse('Not found', { status: 404 })
  return NextResponse.json({
    id: n._id.toString(),
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: !!n.isRead,
    time: (n.time instanceof Date ? n.time : new Date(n.time)).toISOString(),
    sender: n.sender || undefined,
  })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  await dbConnect()
  const res = await NotificationModel.deleteOne({ _id: resolvedParams.id, userId })
  if (!res.deletedCount) return new NextResponse('Not found', { status: 404 })
  return new NextResponse(null, { status: 204 })
}