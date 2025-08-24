import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel } from '@/lib/models'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  const json = await req.json().catch(() => null)
  const code: string | undefined = json?.code?.trim()
  const member: any = json?.member
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  await dbConnect()
  const project: any = await ProjectModel.findOne({ inviteCode: code, archived: { $ne: true } }).lean()
  if (!project) return new NextResponse('Not found', { status: 404 })

  const finalMember = member?.id && member?.name ? member : { id: userId, name: 'Member' }
  const exists = (project.members || []).some((m: any) => m.id === finalMember.id)
  if (exists || project.ownerId === finalMember.id) return NextResponse.json({ joined: true, projectId: project._id.toString() })

  await ProjectModel.updateOne({ _id: project._id }, { $push: { members: finalMember } })
  return NextResponse.json({ joined: true, projectId: project._id.toString() })
}