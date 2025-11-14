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
      publishableKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + '...',
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
      signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up'
    },
    database: {
      configured: !!process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DB || 'togetherflow'
    },
    deployment: {
      vercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL
    }
  }

  return NextResponse.json(health)
}