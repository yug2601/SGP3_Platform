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
        const firstName = user.firstName || ''
        const lastName = user.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim() || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
        
        // Try to create new profile with default values
        const newProfile = await UserModel.create({
          clerkId: userId,
          userId: userId, // Explicitly set userId to prevent null conflicts
          email: user.primaryEmailAddress?.emailAddress,
          name: fullName,
          firstName: firstName,
          lastName: lastName,
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
        console.error('Profile creation error:', createError)
        
        // Handle various duplicate key errors
        if (createError.code === 11000) {
          console.log('Duplicate key error, trying alternative approaches...')
          
          const firstName = user.firstName || ''
          const lastName = user.lastName || ''
          const fullName = `${firstName} ${lastName}`.trim() || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
          
          // Try to find by email first
          if (user.primaryEmailAddress?.emailAddress) {
            userProfile = await UserModel.findOneAndUpdate(
              { email: user.primaryEmailAddress.emailAddress },
              { 
                $set: { 
                  clerkId: userId,
                  name: fullName,
                  firstName: firstName,
                  lastName: lastName,
                  imageUrl: user.imageUrl,
                }
              },
              { new: true, upsert: false }
            ).lean()
          }
          
          // If still not found, try to find any user without clerkId and update
          if (!userProfile) {
            userProfile = await UserModel.findOneAndUpdate(
              { 
                $or: [
                  { clerkId: { $exists: false } },
                  { clerkId: null },
                  { clerkId: '' }
                ]
              },
              { 
                $set: { 
                  clerkId: userId,
                  email: user.primaryEmailAddress?.emailAddress,
                  name: fullName,
                  firstName: firstName,
                  lastName: lastName,
                  imageUrl: user.imageUrl,
                }
              },
              { new: true }
            ).lean()
          }
          
          // Last resort - create with minimal data and ignore conflicts
          if (!userProfile) {
            try {
              // First, clean up any existing null userId entries that might conflict
              await UserModel.deleteMany({
                $or: [
                  { userId: null },
                  { userId: { $exists: false } },
                  { userId: "" }
                ]
              })
              
              const newProfile = await UserModel.create({
                clerkId: userId,
                userId: userId, // Explicitly set userId to prevent null conflicts
                email: user.primaryEmailAddress?.emailAddress || null,
                name: fullName,
                firstName: firstName,
                lastName: lastName,
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
            } catch (finalError) {
              console.error('Final profile creation failed:', finalError)
              // Create a minimal in-memory profile as absolute fallback
              userProfile = {
                _id: 'temp-' + userId,
                clerkId: userId,
                email: user.primaryEmailAddress?.emailAddress,
                name: fullName,
                firstName: firstName,
                lastName: lastName,
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
                },
                createdAt: new Date(),
                updatedAt: new Date()
              } as any
            }
          }
        } else {
          throw createError
        }
      }
    }
    
    // Ensure the user profile has all required fields
    if (userProfile && !(userProfile as any).name) {
      const profileDoc = userProfile as any
      const firstName = profileDoc.firstName || user.firstName || ''
      const lastName = profileDoc.lastName || user.lastName || ''
      const fullName = `${firstName} ${lastName}`.trim() || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
      
      try {
        await UserModel.updateOne(
          { clerkId: userId },
          { $set: { name: fullName, firstName, lastName } }
        )
        profileDoc.name = fullName
        profileDoc.firstName = firstName
        profileDoc.lastName = lastName
      } catch (updateError) {
        console.error('Failed to update user name:', updateError)
        // Update in-memory object anyway
        profileDoc.name = fullName
        profileDoc.firstName = firstName
        profileDoc.lastName = lastName
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
      name: (userProfile as any).name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'User',
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
      
      // Always update name when first/last name changes
      const firstName = personalInfo.firstName !== undefined ? personalInfo.firstName : user.firstName || ''
      const lastName = personalInfo.lastName !== undefined ? personalInfo.lastName : user.lastName || ''
      updateData.name = `${firstName} ${lastName}`.trim() || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
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

    // First, try to update existing profile
    let updatedProfile
    try {
      updatedProfile = await UserModel.findOneAndUpdate(
        { clerkId: userId },
        { $set: updateData },
        { new: true }
      ).lean()
    } catch (duplicateError: any) {
      if (duplicateError.code === 11000) {
        console.log('Duplicate key error during update, cleaning up and retrying...')
        
        // Clean up any null userId entries that might be causing conflicts
        await UserModel.deleteMany({
          $or: [
            { userId: null },
            { userId: { $exists: false } },
            { userId: "" }
          ]
        })
        
        // Retry the update without upsert
        updatedProfile = await UserModel.findOneAndUpdate(
          { clerkId: userId },
          { $set: updateData },
          { new: true }
        ).lean()
      } else {
        throw duplicateError
      }
    }

    // If no profile was found, create one (but only if update didn't work)
    if (!updatedProfile) {
      try {
        // Ensure we have all required fields for creation
        const createData = {
          clerkId: userId,
          userId: userId, // Use clerkId as userId to avoid null conflicts
          ...updateData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        updatedProfile = await UserModel.create(createData)
      } catch (createError: any) {
        if (createError.code === 11000) {
          // If creation fails due to duplicate, try to find the existing profile
          updatedProfile = await UserModel.findOne({ clerkId: userId }).lean()
        } else {
          throw createError
        }
      }
    }

    return NextResponse.json({ 
      profile: updatedProfile,
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    )
  }
}