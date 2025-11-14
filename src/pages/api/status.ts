import { NextApiRequest, NextApiResponse } from 'next'

// This endpoint provides basic API status
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      message: 'Pages API is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    })
  }
  
  return res.status(405).json({ message: 'Method not allowed' })
}