import { auth, getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { Project } from '@/lib/types'
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
    archived: { $ne: true },
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

import { projectCreateSchema } from '@/lib/validation'

export async function POST(req: Request) {
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

  const json = await req.json().catch(() => null)
  const parsed = projectCreateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 })
  const { name, description, status, progress, dueDate, members, archived } = parsed.data

  await dbConnect()
  
  // Get current user info to add as leader
  const { UserModel } = await import('@/lib/models')
  const { currentUser: clerkUser } = await import('@clerk/nextjs/server')
  
  let dbUser: any = null
  let userName = 'User'
  let userAvatar = ''
  
  try {
    dbUser = await UserModel.findOne({ clerkId: userId }).lean()
  } catch (dbError) {
    console.error('Error fetching user from database:', dbError)
  }
  
  // If user doesn't exist in database, try to create them
  if (!dbUser) {
    try {
      const clerk = await clerkUser()
      if (clerk) {
        const firstName = clerk.firstName || ''
        const lastName = clerk.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim() || clerk.username || clerk.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
        
        try {
          dbUser = await UserModel.create({
            clerkId: userId,
            email: clerk.primaryEmailAddress?.emailAddress,
            name: fullName,
            firstName: firstName,
            lastName: lastName,
            imageUrl: clerk.imageUrl,
            bio: '',
            theme: 'system',
            timezone: 'UTC',
            notificationSettings: {
              emailNotifications: true,
              pushNotifications: false,
              weeklyDigest: true,
              projectUpdates: true,
              taskReminders: true,
              teamInvites: true
            },
            stats: {
              projectsCreated: 0,
              tasksCompleted: 0,
              teamCollaborations: 0,
              messagesSent: 0
            }
          })
        } catch (createError: any) {
          console.error('Error creating user profile:', createError)
          // Even if database creation fails, use Clerk data
          userName = fullName
          userAvatar = clerk.imageUrl || ''
        }
      }
    } catch (clerkError) {
      console.error('Error fetching Clerk user:', clerkError)
    }
  }
  
  // Set user display data
  if (dbUser) {
    userName = dbUser.name || `${dbUser.firstName || ''} ${dbUser.lastName || ''}`.trim() || 'User'
    userAvatar = dbUser.imageUrl || ''
  }
  
  // Always add the creator as the first member with leader role
  const projectMembers = [
    {
      id: userId,
      name: userName,
      avatar: userAvatar,
      role: 'leader',
      joinedAt: new Date()
    },
    ...(members || [])
  ]
  
  const created = await ProjectModel.create({
    name,
    description,
    status,
    progress,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    members: projectMembers,
    tasksCount: 0,
    ownerId: userId,
    archived: !!archived,
  })
  // Log project creation activity
  try {
    const { ActivityLogger } = await import('@/lib/activity-logger')
    await ActivityLogger.logProject('created', name, created._id.toString(), userId)
  } catch (error) {
    console.error('Failed to log project creation activity:', error)
  }
  const mapped: Project = {
    id: created._id.toString(),
    name: created.name,
    description: created.description,
    status: created.status,
    progress: created.progress,
    dueDate: created.dueDate ? created.dueDate.toISOString() : undefined,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
    members: created.members || [],
    tasksCount: created.tasksCount || 0,
    ownerId: created.ownerId,
    archived: !!created.archived,
    inviteCode: created.inviteCode || undefined,
  } as any
  return NextResponse.json(mapped, { status: 201 })
}