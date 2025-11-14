import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes only; protect API by default so auth() has session context
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/help',
  '/privacy',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth(.*)',
  // Keep activity public if you want to view it without auth; otherwise remove this line
  '/api/activity(.*)',
  // Add health check route for deployment verification
  '/api/health'
])

export default clerkMiddleware(async (auth, req) => {
  // Skip auth for public routes
  if (isPublicRoute(req)) {
    return
  }
  
  try {
    await auth.protect()
  } catch (error) {
    console.error('Authentication error in middleware:', error)
    // In production, this will properly handle auth failures
    throw error
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Run for API routes too but they are marked public in createRouteMatcher above
    '/(api|trpc)(.*)',
  ],
}