import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Handle Clerk webhook events
    const payload = req.body
    
    // Log the event for debugging
    console.log('Clerk webhook received:', payload?.type || 'unknown event')
    
    // Process the webhook based on event type
    if (payload?.type) {
      switch (payload.type) {
        case 'user.created':
        case 'user.updated':
        case 'user.deleted':
          // Handle user events
          break
        case 'session.created':
        case 'session.ended':
          // Handle session events
          break
        default:
          console.log('Unhandled webhook event:', payload.type)
      }
    }
    
    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}