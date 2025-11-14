import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, ProjectFileModel } from '@/lib/models'
import type { ProjectFile } from '@/lib/types'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, fileId } = await params

    // Validate fileId
    if (!fileId || fileId === 'undefined' || fileId.length !== 24) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
    }

    await dbConnect()

    // Get project and file
    const project = await ProjectModel.findById(id) as any
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const file = await ProjectFileModel.findById(fileId).lean() as ProjectFile | null
    if (!file || file.projectId !== id) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Anyone can delete files (no role restriction as per requirements)

    // Delete the file from database
    await ProjectFileModel.findByIdAndDelete(fileId)

    // Update project files count
    project.filesCount = Math.max(0, (project.filesCount || 0) - 1)
    await project.save()

    // Note: File data was stored in database, so no physical file to delete

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}