import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ActivityModel } from '@/lib/models'

import { auth } from '@clerk/nextjs/server'
import { ProjectModel } from '@/lib/models'

export async function GET() {
  const { userId } = await auth()
  await dbConnect()
  let query: any = {}
  if (userId) {
    const visible = await ProjectModel.find({ $or: [{ ownerId: userId }, { 'members.id': userId }] }).select('_id').lean()
    const ids = visible.map((p: any) => p._id)
    query = { $or: [{ projectId: { $in: ids } }, { projectId: { $exists: false } }] }
  }
  const docs = await ActivityModel.find(query).sort({ time: -1 }).limit(50).lean()
  const items = docs.map((a: any) => ({
    id: a._id.toString(),
    type: a.type,
    message: a.message,
    time: (a.time instanceof Date ? a.time : new Date(a.time)).toISOString(),
    user: a.user,
  }))
  return NextResponse.json(items)
}