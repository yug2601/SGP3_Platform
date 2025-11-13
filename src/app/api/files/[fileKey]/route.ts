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
    await dbConnect()

    // Find the file by fileKey
    const file = await ProjectFileModel.findOne({ fileKey }).lean() as any
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

    // In a real application, you would fetch the file from cloud storage
    // For this demo, we'll simulate file download by returning file metadata
    // In production, you would stream the actual file content
    
    // For demo purposes, return a response that triggers download
    return new NextResponse(
      `This is a demo file: ${file.name}\nSize: ${file.size} bytes\nUploaded: ${file.uploadedAt}`,
      {
        status: 200,
        headers: {
          'Content-Type': file.mimeType,
          'Content-Disposition': `attachment; filename="${file.name}"`,
        },
      }
    )
  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}