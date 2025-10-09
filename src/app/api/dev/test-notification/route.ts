import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { NotificationService } from '@/lib/notification-service'

export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not available in production', { status: 404 })
  }

  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })

  try {
    const body = await req.json()
    const { type = 'task_assigned', title = 'Test Notification', message = 'This is a test notification' } = body

    await NotificationService.send({
      userId,
      type,
      title,
      message,
      sender: {
        id: 'system',
        name: 'System',
        avatar: undefined
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Test notification sent',
      notification: { userId, type, title, message }
    })
  } catch (error) {
    console.error('Failed to send test notification:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}