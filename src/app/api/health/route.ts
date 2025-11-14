import { NextResponse } from 'next/server'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    clerk: {
      configured: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      publishableKeyExists: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKeyExists: !!process.env.CLERK_SECRET_KEY,
    },
    database: {
      configured: !!process.env.MONGODB_URI,
    }
  }

  return NextResponse.json(health)
}