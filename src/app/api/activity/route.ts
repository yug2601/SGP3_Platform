import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ActivityModel } from '@/lib/models'

export async function GET() {
  await dbConnect()
  const docs = await ActivityModel.find({}).sort({ time: -1 }).limit(50).lean()
  const items = docs.map((a: any) => ({
    id: a._id.toString(),
    type: a.type,
    message: a.message,
    time: (a.time instanceof Date ? a.time : new Date(a.time)).toISOString(),
    user: a.user,
  }))
  return NextResponse.json(items)
}