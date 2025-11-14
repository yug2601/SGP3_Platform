import { NextApiRequest, NextApiResponse } from 'next'
import { getAuth } from '@clerk/nextjs/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId, sessionId, orgId } = getAuth(req)
    
    if (req.method === 'GET') {
      return res.status(200).json({
        userId,
        sessionId,
        orgId,
        authenticated: !!userId
      })
    }
    
    return res.status(405).json({ message: 'Method not allowed' })
  } catch (error) {
    console.error('Session API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}