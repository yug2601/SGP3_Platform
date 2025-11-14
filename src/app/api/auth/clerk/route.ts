import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Simple Clerk webhook handler without svix dependency
    console.log('Clerk webhook received')
    
    // Get the body for logging
    const payload = await req.text()
    
    // Log the webhook for debugging
    console.log('Webhook payload received:', payload.substring(0, 100) + '...')
    
    return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Clerk webhook endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  }, { status: 200 })
}