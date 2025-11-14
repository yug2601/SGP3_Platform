import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { UserModel } from '@/lib/models'

export async function DELETE() {
  try {
    await dbConnect()
    
    // Find all users with null or undefined userId
    const nullUserEntries = await UserModel.find({
      $or: [
        { userId: null },
        { userId: { $exists: false } },
        { userId: "" }
      ]
    })

    console.log(`Found ${nullUserEntries.length} entries with null/empty userId`)

    // Delete all entries with null/empty userId
    const deleteResult = await UserModel.deleteMany({
      $or: [
        { userId: null },
        { userId: { $exists: false } },
        { userId: "" }
      ]
    })

    console.log(`Deleted ${deleteResult.deletedCount} entries with null/empty userId`)

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deleteResult.deletedCount} duplicate null userId entries`,
      deletedCount: deleteResult.deletedCount,
      foundEntries: nullUserEntries.length
    })

  } catch (error) {
    console.error('Database cleanup error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to cleanup database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await dbConnect()
    
    // Find all users with null or undefined userId (without deleting)
    const nullUserEntries = await UserModel.find({
      $or: [
        { userId: null },
        { userId: { $exists: false } },
        { userId: "" }
      ]
    }).select('_id userId clerkId name email createdAt')

    // Also get total user count
    const totalUsers = await UserModel.countDocuments()

    return NextResponse.json({
      success: true,
      nullUserEntries,
      totalNullEntries: nullUserEntries.length,
      totalUsers,
      message: `Found ${nullUserEntries.length} entries with null/empty userId out of ${totalUsers} total users`
    })

  } catch (error) {
    console.error('Database analysis error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}