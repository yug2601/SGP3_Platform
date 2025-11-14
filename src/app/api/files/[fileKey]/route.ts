import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import { ProjectFileModel, ProjectModel } from '@/lib/models'
import { getProjectPermissions } from '@/lib/permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileKey: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileKey } = await params
    // Decode the fileKey which was URL encoded
    const decodedFileKey = decodeURIComponent(fileKey)
    await dbConnect()

    // Find the file by fileKey
    const file = await ProjectFileModel.findOne({ fileKey: decodedFileKey }).lean() as any
    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const project = await ProjectModel.findById(file.projectId).lean() as any
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const permissions = getProjectPermissions(project, userId)
    if (!permissions.canViewProject()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Serve file from database
    
    console.log(`Looking for file with key: ${decodedFileKey}`)
    
    // Check if file has buffer data stored
    if (!file.fileBuffer) {
      console.log(`File has no buffer data: ${decodedFileKey}`)
      return NextResponse.json({ error: 'File data not found' }, { status: 404 })
    }
    
    // Convert base64 back to buffer and serve
    try {
      const fileBuffer = Buffer.from(file.fileBuffer, 'base64')
      
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': file.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${file.name}"`,
          'Content-Length': file.size.toString(),
        },
      })
    } catch (readError) {
      console.error('Error processing file buffer:', readError)
      return NextResponse.json({ error: 'Error processing file' }, { status: 500 })
    }
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}