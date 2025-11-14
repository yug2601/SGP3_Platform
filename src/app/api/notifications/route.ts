import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { NotificationModel } from '@/lib/models'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  
  try {
    await dbConnect()
    const docs = await NotificationModel.find({ userId }).sort({ time: -1 }).lean()
    const items = docs.map((n: any) => ({
      id: n._id.toString(),
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: !!n.isRead,
      time: (n.time instanceof Date ? n.time : new Date(n.time)).toISOString(),
      sender: n.sender || undefined,
    }))
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    // Return empty array instead of failing
    return NextResponse.json([])
  }
}

export async function PATCH() {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  
  try {
    await dbConnect()
    await NotificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    )
    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }
}