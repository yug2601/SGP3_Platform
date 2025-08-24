import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ name: 'You' })
  try {
    const { users } = await import('@clerk/nextjs') as any
    const user = (users && users.getUser) ? await users.getUser(userId) : null
    const name = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'You' : 'You'
    return NextResponse.json({ name })
  } catch {
    return NextResponse.json({ name: 'You' })
  }
}