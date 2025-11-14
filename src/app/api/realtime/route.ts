/**
 * Real-time notification endpoint using Server-Sent Events (SSE)
 * This is compatible with Vercel's serverless environment
 * Recreated from the original pages/api/realtime.ts
 */

import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Handle Server-Sent Events
  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()
  
  // Set up Server-Sent Events headers
  const response = new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })

  // Send initial connection message
  const initialMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`
  writer.write(encoder.encode(initialMessage))

  // Set up periodic heartbeat (keep connection alive)
  const heartbeatInterval = setInterval(() => {
    try {
      const heartbeatMessage = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`
      writer.write(encoder.encode(heartbeatMessage))
    } catch {
      clearInterval(heartbeatInterval)
    }
  }, 30000)

  // Clean up on disconnect (after 5 minutes)
  setTimeout(() => {
    try {
      clearInterval(heartbeatInterval)
      writer.close()
    } catch {
      console.log('SSE cleanup completed')
    }
  }, 300000) // 5 minutes

  return response
}

export async function POST(request: NextRequest) {
  try {
    // Handle notification broadcasting
    const { userId, type, message, roomId } = await request.json()

    // In a real implementation, you'd store this in a database or Redis
    // and broadcast to connected clients
    console.log('Broadcasting notification:', { userId, type, message, roomId })
    
    return new Response(JSON.stringify({ 
      status: 'sent',
      timestamp: Date.now(),
      data: { userId, type, message, roomId }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch {
    return new Response(JSON.stringify({
      error: 'Failed to process notification'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}