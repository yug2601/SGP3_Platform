import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { UserModel } from '@/lib/models'

export async function POST() {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    const results: any = {
      duplicatesRemoved: 0,
      nullValuesFixed: 0,
      orphanRecordsRemoved: 0,
      errors: []
    }

    // 1. Find and remove duplicate users (keep the one with clerkId)
    const allUsers = await UserModel.find({}).lean()
    const emailGroups: Record<string, any[]> = {}
    
    // Group users by email
    allUsers.forEach(user => {
      if (user.email) {
        if (!emailGroups[user.email]) {
          emailGroups[user.email] = []
        }
        emailGroups[user.email].push(user)
      }
    })

    // Remove duplicates
    for (const [/* userEmail */, users] of Object.entries(emailGroups)) {
      if (users.length > 1) {
        // Keep the user with clerkId, remove others
        const usersWithClerkId = users.filter(u => u.clerkId)
        const usersWithoutClerkId = users.filter(u => !u.clerkId)
        
        if (usersWithClerkId.length > 0 && usersWithoutClerkId.length > 0) {
          // Remove users without clerkId
          for (const user of usersWithoutClerkId) {
            try {
              await UserModel.deleteOne({ _id: user._id })
              results.duplicatesRemoved++
            } catch (error) {
              results.errors.push(`Failed to remove duplicate user ${user._id}: ${error}`)
            }
          }
        } else if (usersWithClerkId.length > 1) {
          // Multiple users with different clerkIds - keep the most recent one
          const sortedUsers = usersWithClerkId.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
          for (let i = 1; i < sortedUsers.length; i++) {
            try {
              await UserModel.deleteOne({ _id: sortedUsers[i]._id })
              results.duplicatesRemoved++
            } catch (error) {
              results.errors.push(`Failed to remove duplicate user ${sortedUsers[i]._id}: ${error}`)
            }
          }
        }
      }
    }

    // 2. Fix users with null/empty clerkId or email
    const usersWithNullData = await UserModel.find({
      $or: [
        { clerkId: null },
        { clerkId: '' },
        { clerkId: { $exists: false } },
        { email: null },
        { email: '' }
      ]
    }).lean()

    for (const user of usersWithNullData) {
      try {
        // If no clerkId, this is likely an orphan record - remove it
        if (!user.clerkId) {
          await UserModel.deleteOne({ _id: user._id })
          results.orphanRecordsRemoved++
        } else {
          // Fix null email
          const updateData: any = {}
          if (!user.email) {
            updateData.email = null // Explicitly set to null to avoid index conflicts
          }
          if (Object.keys(updateData).length > 0) {
            await UserModel.updateOne({ _id: user._id }, { $set: updateData })
            results.nullValuesFixed++
          }
        }
      } catch (error) {
        results.errors.push(`Failed to fix user ${user._id}: ${error}`)
      }
    }

    // 3. Ensure current user exists and is properly set up
    const currentUserProfile = await UserModel.findOne({ clerkId: userId }).lean()
    if (!currentUserProfile) {
      try {
        const firstName = clerkUser.firstName || ''
        const lastName = clerkUser.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim() || clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
        
        await UserModel.create({
          clerkId: userId,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: fullName,
          firstName: firstName,
          lastName: lastName,
          imageUrl: clerkUser.imageUrl,
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
        results.currentUserCreated = true
      } catch (error) {
        results.errors.push(`Failed to create current user profile: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Database cleanup completed. Removed ${results.duplicatesRemoved} duplicates, fixed ${results.nullValuesFixed} null values, removed ${results.orphanRecordsRemoved} orphan records.`
    })

  } catch (error) {
    console.error('Error in database cleanup:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Analyze database issues
    const totalUsers = await UserModel.countDocuments({})
    const usersWithoutClerkId = await UserModel.countDocuments({
      $or: [
        { clerkId: null },
        { clerkId: '' },
        { clerkId: { $exists: false } }
      ]
    })
    
    const usersWithoutEmail = await UserModel.countDocuments({
      $or: [
        { email: null },
        { email: '' },
        { email: { $exists: false } }
      ]
    })

    // Find potential duplicates by email
    const emailDuplicates = await UserModel.aggregate([
      { 
        $match: { 
          email: { 
            $exists: true, 
            $nin: [null, ''] 
          } 
        } 
      },
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ])

    return NextResponse.json({
      analysis: {
        totalUsers,
        usersWithoutClerkId,
        usersWithoutEmail,
        emailDuplicates: emailDuplicates.length,
        duplicateEmails: emailDuplicates.map(d => ({ userEmail: d._id, count: d.count }))
      },
      recommendation: usersWithoutClerkId > 0 || emailDuplicates.length > 0 ? 'Run POST to this endpoint to clean up the database' : 'Database looks clean'
    })

  } catch (error) {
    console.error('Error analyzing database:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}