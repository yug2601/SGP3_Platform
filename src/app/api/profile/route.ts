import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import { UserModel, ProjectModel, TaskModel, ChatMessageModel } from '@/lib/models'
import { UserProfile } from '@/lib/types'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Get or create user profile
    let userProfile = await UserModel.findOne({ clerkId: userId }).lean()
    
    if (!userProfile) {
      try {
        // Try to create new profile with default values
        const newProfile = await UserModel.create({
          clerkId: userId,
          email: user.primaryEmailAddress?.emailAddress,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          imageUrl: user.imageUrl,
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
        userProfile = newProfile.toObject()
      } catch (createError: any) {
        // Handle duplicate key error - user might exist with same email but different clerkId
        if (createError.code === 11000) {
          console.log('Duplicate key error, trying to find existing user by email...')
          
          // Find user by email and update clerkId
          userProfile = await UserModel.findOneAndUpdate(
            { email: user.primaryEmailAddress?.emailAddress },
            { 
              $set: { 
                clerkId: userId,
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                imageUrl: user.imageUrl,
              }
            },
            { new: true }
          ).lean()

          if (!userProfile) {
            throw new Error('Failed to find or update existing user profile')
          }
        } else {
          throw createError
        }
      }
    }

    // Calculate real-time statistics
    const [projectsCreated, tasksCompleted, teamCollaborations, messagesSent] = await Promise.all([
      ProjectModel.countDocuments({ ownerId: userId }),
      TaskModel.countDocuments({ 
        $or: [
          { creatorId: userId, status: 'done' },
          { 'assignee.id': userId, status: 'done' }
        ]
      }),
      ProjectModel.countDocuments({ 'members.id': userId }),
      ChatMessageModel.countDocuments({ 'sender.id': userId })
    ])

    // Update stats in database
    await UserModel.updateOne(
      { clerkId: userId },
      {
        $set: {
          'stats.projectsCreated': projectsCreated,
          'stats.tasksCompleted': tasksCompleted,
          'stats.teamCollaborations': teamCollaborations,
          'stats.messagesSent': messagesSent
        }
      }
    )

    if (!userProfile) {
      throw new Error('Failed to create or retrieve user profile')
    }

    const profile: UserProfile = {
      id: (userProfile as any)._id?.toString() || '',
      clerkId: (userProfile as any).clerkId || userId,
      email: (userProfile as any).email || user.primaryEmailAddress?.emailAddress,
      name: (userProfile as any).name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      firstName: (userProfile as any).firstName || user.firstName || '',
      lastName: (userProfile as any).lastName || user.lastName || '',
      imageUrl: (userProfile as any).imageUrl || user.imageUrl,
      bio: (userProfile as any).bio || '',
      preferences: {
        theme: (userProfile as any).theme || 'system',
        timezone: (userProfile as any).timezone || 'UTC'
      },
      notificationSettings: (userProfile as any).notificationSettings || {
        emailNotifications: true,
        pushNotifications: false,
        weeklyDigest: true,
        projectUpdates: true,
        taskReminders: true,
        teamInvites: true
      },
      stats: {
        projectsCreated,
        tasksCompleted,
        teamCollaborations,
        messagesSent
      },
      createdAt: (userProfile as any).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (userProfile as any).updatedAt?.toISOString() || new Date().toISOString()
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    const user = await currentUser()
    
    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { personalInfo, preferences, notificationSettings } = body

    await dbConnect()

    const updateData: any = {}

    if (personalInfo) {
      if (personalInfo.firstName !== undefined) updateData.firstName = personalInfo.firstName
      if (personalInfo.lastName !== undefined) updateData.lastName = personalInfo.lastName
      if (personalInfo.bio !== undefined) updateData.bio = personalInfo.bio
      if (personalInfo.firstName && personalInfo.lastName) {
        updateData.name = `${personalInfo.firstName} ${personalInfo.lastName}`.trim()
      }
    }

    if (preferences) {
      if (preferences.theme !== undefined) updateData.theme = preferences.theme
      if (preferences.timezone !== undefined) updateData.timezone = preferences.timezone
    }

    if (notificationSettings) {
      for (const [key, value] of Object.entries(notificationSettings)) {
        if (typeof value === 'boolean') {
          updateData[`notificationSettings.${key}`] = value
        }
      }
    }

    const updatedProfile = await UserModel.findOneAndUpdate(
      { clerkId: userId },
      { $set: updateData },
      { new: true, upsert: true }
    ).lean()

    return NextResponse.json({ 
      profile: updatedProfile,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}