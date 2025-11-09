import { NextApiRequest, NextApiResponse } from 'next'

// Real-time notification endpoint using Server-Sent Events (SSE)
// This is more compatible with Vercel's serverless environment
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    })

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`)

    // Keep connection alive with periodic heartbeat
    const heartbeat = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`)
    }, 30000)

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(heartbeat)
      res.end()
    })

    req.on('error', () => {
      clearInterval(heartbeat)
      res.end()
    })

  } else if (req.method === 'POST') {
    // Handle notification broadcasting
    const { userId, type, message, roomId } = req.body

    // In a real implementation, you'd store this in a database or Redis
    // and broadcast to connected clients
    console.log('Broadcasting notification:', { userId, type, message, roomId })
    
    res.status(200).json({ 
      status: 'sent',
      timestamp: Date.now(),
      data: { userId, type, message, roomId }
    })
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}