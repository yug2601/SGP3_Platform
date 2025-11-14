/**
 * Simplified Socket.IO endpoint for Vercel compatibility
 * Recreated from the original pages/api/socketio.ts
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Return connection info
  return NextResponse.json({
    status: 'connected',
    transport: 'polling',
    timestamp: Date.now()
  }, { headers })
}

export async function POST(request: NextRequest) {
  try {
    // Handle message posting
    const { roomId, message, userId, type } = await request.json()
    
    // Log the message (in production, you'd handle real broadcasting)
    console.log('Socket message:', { roomId, message, userId, type })
    
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    return NextResponse.json({
      status: 'message_sent',
      data: { roomId, message, userId, type },
      timestamp: Date.now()
    }, { headers })
  } catch {
    return NextResponse.json({
      error: 'Invalid request format'
    }, { status: 400 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}