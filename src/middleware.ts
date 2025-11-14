import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/help',
  '/privacy',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth(.*)',
  '/api/activity(.*)',
  '/api/health',
  '/not-found',
  '/error',
  '/auth-required'
])

// Fallback middleware when Clerk is not configured
function fallbackMiddleware(request: NextRequest) {
  console.log('Using fallback middleware - Clerk not configured')
  
  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }
  
  // Redirect protected routes to auth-required page
  return NextResponse.redirect(new URL('/auth-required', request.url))
}

export default function middleware(request: NextRequest) {
  // Check if Clerk environment variables are present
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY
  
  // Use fallback middleware if Clerk is not configured
  if (!publishableKey || !secretKey) {
    return fallbackMiddleware(request)
  }
  
  // Use Clerk middleware if properly configured
  return clerkMiddleware(async (auth, req) => {
    // Skip auth for public routes
    if (isPublicRoute(req)) {
      return NextResponse.next()
    }
    
    try {
      await auth.protect()
      return NextResponse.next()
    } catch (error) {
      console.error('Authentication error:', error)
      // Redirect to sign-in on auth failure
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(signInUrl)
    }
  })(request)
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Run for API routes too but they are marked public in createRouteMatcher above
    '/(api|trpc)(.*)',
  ],
}