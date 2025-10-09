import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ActivityModel, ProjectModel } from '@/lib/models'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const type = searchParams.get('type') // Filter by activity type
    const personal = searchParams.get('personal') === 'true' // Show only user's own activities

    let query: any = {}

    if (personal) {
      // Show only activities by this specific user
      query.userId = userId
    } else {
      // Show activities from user's projects + own activities
      const visibleProjects = await ProjectModel.find({ 
        $or: [{ ownerId: userId }, { 'members.id': userId }] 
      }).select('_id').lean()
      const projectIds = visibleProjects.map((p: any) => p._id)
      
      query = {
        $or: [
          { userId }, // User's own activities
          { projectId: { $in: projectIds } }, // Activities in user's projects
          { projectId: { $exists: false } } // Global activities
        ]
      }
    }

    if (type) {
      query.type = new RegExp(type, 'i')
    }

    const docs = await ActivityModel.find(query)
      .sort({ time: -1 })
      .limit(limit)
      .lean()

    const items = docs.map((a: any) => ({
      id: a._id.toString(),
      type: a.type,
      message: a.message,
      time: (a.time instanceof Date ? a.time : new Date(a.time)).toISOString(),
      user: a.user || { id: a.userId, name: 'Unknown User', avatar: '' },
      projectId: a.projectId?.toString(),
      taskId: a.taskId?.toString(),
      metadata: a.metadata || {}
    }))

    return NextResponse.json(items)
  } catch (error) {
    console.error('Activity API error:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ActivityLogger } = await import('@/lib/activity-logger')
    const { type, message, projectId, taskId, metadata } = await req.json()

    await ActivityLogger.log({
      type,
      message,
      userId,
      projectId,
      taskId,
      metadata
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Activity POST error:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}