import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, ChatMessageModel } from '@/lib/models'

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  await dbConnect()
  const { projectId } = await params
  const docs = await ChatMessageModel.find({ projectId: projectId as any }).sort({ timestamp: 1 }).lean()
  const messages = docs.map((m: any) => ({
    id: m._id.toString(),
    projectId: m.projectId.toString(),
    content: m.content,
    sender: m.sender,
    timestamp: (m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp)).toISOString(),
  }))
  return NextResponse.json(messages)
}

import { chatMessageCreateSchema } from '@/lib/validation'

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  const json = await req.json().catch(() => null)
  const parsed = chatMessageCreateSchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.flatten() }, { status: 400 })
  const { content, sender } = parsed.data

  await dbConnect()
  const { projectId } = await params
  const project = await ProjectModel.findById(projectId).lean()
  if (!project) return new NextResponse('Not found', { status: 404 })

  const created = await ChatMessageModel.create({ projectId, content, sender })
  return NextResponse.json({
    id: created._id.toString(),
    projectId: created.projectId.toString(),
    content: created.content,
    sender: created.sender,
    timestamp: created.timestamp.toISOString(),
  }, { status: 201 })
}