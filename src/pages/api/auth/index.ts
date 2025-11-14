import { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint handles Clerk's authentication callbacks
  // It's required for Clerk to work properly
  
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'Clerk auth endpoint',
      timestamp: new Date().toISOString()
    })
  }
  
  if (req.method === 'POST') {
    // Handle Clerk authentication data
    return res.status(200).json({ 
      message: 'Auth data received',
      timestamp: new Date().toISOString()
    })
  }
  
  return res.status(405).json({ message: 'Method not allowed' })
}