import { NextApiRequest, NextApiResponse } from 'next'

// Simplified Socket.IO endpoint for Vercel compatibility
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method === 'GET') {
    // Return connection info
    res.status(200).json({
      status: 'connected',
      transport: 'polling',
      timestamp: Date.now()
    })
  } else if (req.method === 'POST') {
    // Handle message posting
    const { roomId, message, userId, type } = req.body
    
    // Log the message (in production, you'd handle real broadcasting)
    console.log('Socket message:', { roomId, message, userId, type })
    
    res.status(200).json({
      status: 'message_sent',
      data: { roomId, message, userId, type },
      timestamp: Date.now()
    })
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}