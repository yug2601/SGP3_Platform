import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, ProjectFileModel } from '@/lib/models'
import type { Project } from '@/lib/types'

// Fixed Next.js 15 params handling

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()
    
    // Get project and check access
    const project = await ProjectModel.findById(id).lean() as Project | null
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Direct permission check - if user is owner or member, they can view
    const isOwner = project.ownerId === userId
    const isMember = project.members?.some((m: any) => m.id === userId) || false
    
    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get files with optional search and sorting
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const sortBy = url.searchParams.get('sortBy') || 'uploadedAt'
    const sortOrder = url.searchParams.get('sortOrder') || 'desc'

    const query: any = { projectId: id }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    const sortOptions: any = {}
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

    const files = await ProjectFileModel.find(query)
      .sort(sortOptions)
      .lean() as any[]

    // Map MongoDB _id to id
    const mappedFiles = files.map(file => ({
      id: file._id.toString(),
      projectId: file.projectId,
      name: file.name,
      originalName: file.originalName,
      size: file.size,
      mimeType: file.mimeType,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.uploadedAt,
      url: file.url,
      fileKey: file.fileKey
    }))

    return NextResponse.json(mappedFiles)
  } catch (error) {
    console.error('Error fetching project files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await dbConnect()
    
    // Get project and check permissions
    const project = await ProjectModel.findById(id) as any
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Anyone can upload files (no role restriction as per requirements)

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // In a real app, you'd upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For this demo, we'll simulate file storage
    const fileKey = `${id}/${Date.now()}-${file.name}`
    const fileUrl = `/api/files/${fileKey}` // Simulated URL

    const fileData = {
      projectId: id,
      name: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      uploadedBy: {
        id: userId,
        name: 'User', // In real app, get from Clerk user data
      },
      uploadedAt: new Date().toISOString(),
      url: fileUrl,
      fileKey,
    }

    const createdFile = await ProjectFileModel.create(fileData)
    const fileDoc = createdFile.toObject()

    // Update project files count
    project.filesCount = (project.filesCount || 0) + 1
    await project.save()

    // Map MongoDB _id to id
    const responseFile = {
      id: fileDoc._id.toString(),
      projectId: fileDoc.projectId,
      name: fileDoc.name,
      originalName: fileDoc.originalName,
      size: fileDoc.size,
      mimeType: fileDoc.mimeType,
      uploadedBy: fileDoc.uploadedBy,
      uploadedAt: fileDoc.uploadedAt,
      url: fileDoc.url,
      fileKey: fileDoc.fileKey
    }

    return NextResponse.json(responseFile)
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}