export const dynamic = 'force-dynamic'
import { auth } from '@clerk/nextjs/server'
import { createClerkClient } from '@clerk/backend'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, UserModel } from '@/lib/models'

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) return new NextResponse('Unauthorized', { status: 401 })
  const body = await req.json().catch(() => null)
  const email: string | undefined = body?.email
  const member = body?.member // optional direct member {id,name,avatar}
  if (!email && !(member?.id && member?.name)) return NextResponse.json({ error: 'email or member required' }, { status: 400 })

  await dbConnect()
  const { id } = await ctx.params
  const project: any = await ProjectModel.findOne({ _id: id, ownerId: userId }).lean()
  if (!project) return new NextResponse('Not found', { status: 404 })

  let toAdd: any = member
  if (!toAdd && email) {
    // 1) Try local User collection
    let user: any = await UserModel.findOne({ email }).lean()

    // 2) Fallback to Clerk directory lookup
    if (!user) {
      try {
        const secretKey = process.env.CLERK_SECRET_KEY
        if (secretKey) {
          const clerk = createClerkClient({ secretKey })
          const list = await clerk.users.getUserList({ emailAddress: [email] })
          const found = Array.isArray(list?.data) ? list.data[0] : undefined
          if (found) {
            user = { clerkId: found.id, name: `${found.firstName || ''} ${found.lastName || ''}`.trim() || found.username, imageUrl: found.imageUrl }
          }
        }
      } catch {}
    }

    if (!user) return NextResponse.json({ error: 'User not found for email' }, { status: 404 })

    const singleUser = Array.isArray(user) ? user[0] : user
    toAdd = { id: (singleUser as any).clerkId || singleUser._id?.toString(), name: singleUser.name || email.split('@')[0], avatar: singleUser.imageUrl }
  }

  const exists = (project.members || []).some((m: any) => m.id === toAdd.id)
  if (exists) return NextResponse.json({ added: true })

  await ProjectModel.updateOne({ _id: id }, { $push: { members: toAdd } })
  return NextResponse.json({ added: true })
}