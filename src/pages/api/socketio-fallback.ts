import { NextApiRequest, NextApiResponse } from 'next'

// Simple WebSocket fallback for Vercel
const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    // For Vercel, we'll implement a polling-based system instead of persistent WebSockets
    res.status(200).json({ 
      message: 'Socket.IO endpoint active',
      timestamp: Date.now(),
      transport: 'polling'
    })
  } else if (req.method === 'POST') {
    // Handle Socket.IO polling requests
    const { transport } = req.query
    
    if (transport === 'polling') {
      // Simulate Socket.IO polling response
      res.setHeader('Content-Type', 'text/plain; charset=UTF-8')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
      res.status(200).send('ok')
    } else {
      res.status(200).json({ status: 'ok' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}

export default SocketHandler