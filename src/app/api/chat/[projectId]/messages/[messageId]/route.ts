import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ChatMessageModel, ActivityModel } from '@/lib/models'

// Type definition for the message document
interface MessageDocument {
  _id: string
  projectId: string
  content: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
}

export async function DELETE(
  _req: Request, 
  { params }: { params: Promise<{ projectId: string; messageId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await dbConnect()
    const { projectId, messageId } = await params
    
    if (!projectId || !messageId) {
      return NextResponse.json({ 
        error: 'Project ID and Message ID are required' 
      }, { status: 400 })
    }

    // Find the message and verify ownership or permission
    const message = await ChatMessageModel.findById(messageId).lean() as MessageDocument | null
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user can delete this message (either owner or admin)
    if (!message.sender || message.sender.id !== userId) {
      // Could add additional permission checks here for admins
      return new NextResponse('Forbidden - You can only delete your own messages', { 
        status: 403 
      })
    }

    if (!message.projectId || message.projectId.toString() !== projectId) {
      return NextResponse.json({ error: 'Message does not belong to this project' }, { 
        status: 400 
      })
    }

    // Delete the message
    await ChatMessageModel.findByIdAndDelete(messageId)
    
    // Log activity (non-blocking)
    try {
      await ActivityModel.create({ 
        type: 'comment_deleted', 
        message: `Chat message deleted from project`, 
        user: message.sender, 
        userId: userId,
        projectId 
      })
    } catch (activityError) {
      console.error('Failed to log activity:', activityError)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Message deleted successfully',
      deletedMessageId: messageId
    })
  } catch (error) {
    console.error('DELETE /api/chat/[projectId]/messages/[messageId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}