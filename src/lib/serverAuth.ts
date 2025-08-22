import { auth } from '@clerk/nextjs/server'
import { createClerkClient } from '@clerk/backend'

/**
 * Resolve the authenticated user id from request.
 * - Prefer Clerk middleware context via auth()
 * - Fallback to verifying Authorization: Bearer <token> header (dev-friendly)
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  // 1) Middleware context (best path)
  const { userId } = await auth()
  if (userId) return userId

  // 2) Try Authorization: Bearer <token> header (session token or JWT)
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
  const bearerToken = (() => {
    if (!authHeader) return null
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null
    return parts[1]
  })()

  // 3) Try Clerk session cookie (__session) when present
  const cookieHeader = req.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf('=')
        return idx === -1 ? [c, ''] : [decodeURIComponent(c.slice(0, idx)), decodeURIComponent(c.slice(idx + 1))]
      })
  ) as Record<string, string>
  const cookieToken = cookies['__session'] || null

  const token = bearerToken || cookieToken
  if (!token) return null

  try {
    const secretKey = process.env.CLERK_SECRET_KEY
    if (!secretKey) return null
    const clerk = createClerkClient({ secretKey })
    const session = await clerk.sessions.verifySession(token, token)
    return session?.userId || null
  } catch {
    return null
  }
}