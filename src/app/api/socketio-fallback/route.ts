/**
 * Simple WebSocket fallback for Vercel
 * Recreated from the original pages/api/socketio-fallback.ts
 */

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  // For Vercel, we'll implement a polling-based system instead of persistent WebSockets
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
  }
  
  return NextResponse.json({ 
    message: 'Socket.IO endpoint active',
    timestamp: Date.now(),
    transport: 'polling'
  }, { headers })
}

export async function POST(request: NextRequest) {
  // Handle Socket.IO polling requests
  const transport = request.nextUrl.searchParams.get('transport')
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST',
  }
  
  if (transport === 'polling') {
    // Simulate Socket.IO polling response
    return new NextResponse('ok', {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'text/plain; charset=UTF-8',
      }
    })
  } else {
    return NextResponse.json({ status: 'ok' }, { headers })
  }
}