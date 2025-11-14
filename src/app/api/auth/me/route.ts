import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { UserModel } from '@/lib/models'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ name: 'You', userId: null })
  
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return NextResponse.json({ name: 'You' })

    // Try to get from database first, but don't fail if DB is down
    try {
      await dbConnect()
      
      // Get or create user profile in database
      let userProfile = await UserModel.findOne({ clerkId: userId }).lean()
      
      if (!userProfile) {
        // Try to create new user profile with data from Clerk
        const firstName = clerkUser.firstName || ''
        const lastName = clerkUser.lastName || ''
        const fullName = `${firstName} ${lastName}`.trim() || clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
        
        try {
          userProfile = await UserModel.create({
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
        } catch (createError: any) {
          console.error('Failed to create user profile in auth/me:', createError)
          // Even if creation fails, continue with Clerk data
        }
      }
      
      if (userProfile) {
        const displayName = userProfile.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User'
        return NextResponse.json({ 
          name: displayName,
          userId: userId 
        })
      }
    } catch (dbError) {
      console.error('Database error in /api/auth/me, falling back to Clerk data:', dbError)
    }
    
    // Fallback to Clerk data if database operations fail
    const firstName = clerkUser.firstName || ''
    const lastName = clerkUser.lastName || ''
    const fallbackName = `${firstName} ${lastName}`.trim() || clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User'
    
    return NextResponse.json({ 
      name: fallbackName,
      userId: userId 
    })
  } catch (error) {
    console.error('Error in /api/auth/me:', error)
    return NextResponse.json({ name: 'User', userId: userId })
  }
}