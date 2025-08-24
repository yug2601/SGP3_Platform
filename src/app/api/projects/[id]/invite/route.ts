import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel } from '@/lib/models'

function genCode(len = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  await dbConnect()
  const { id } = await ctx.params
  const project: any = await ProjectModel.findOne({ _id: id, ownerId: userId }).lean()
  if (!project) return new NextResponse('Not found', { status: 404 })

  const code = genCode()
  await ProjectModel.updateOne({ _id: id }, { $set: { inviteCode: code } })
  return NextResponse.json({ inviteCode: code })
}