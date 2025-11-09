import { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'

// Extend the Next.js response type to include socket server
interface NextApiResponseWithSocket extends NextApiResponse {
  socket: {
    server: any
  }
}

// Global variable to store the IO server instance
let io: IOServer | undefined

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO...')
    
    // Initialize Socket.IO with the existing server
    io = new IOServer(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app'] 
          : ['http://localhost:3000'],
        methods: ["GET", "POST"],
        credentials: true
      }
    })

    // Socket.IO event handlers
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id)

      // Handle user joining their notification room
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user:${userId}`)
        console.log(`User ${socket.id} joined notification room for user ${userId}`)
      })

      // Handle user joining project room
      socket.on('join-project', (projectId: string) => {
        socket.join(`project:${projectId}`)
        console.log(`User ${socket.id} joined project room ${projectId}`)
      })

      // Handle user leaving project room
      socket.on('leave-project', (projectId: string) => {
        socket.leave(`project:${projectId}`)
        console.log(`User ${socket.id} left project room ${projectId}`)
      })

      // Legacy: Handle join room
      socket.on('join-room', (roomId: string) => {
        socket.join(roomId)
        console.log(`User ${socket.id} joined room ${roomId}`)
      })

      // Handle chat message
      socket.on('send-message', (data: any) => {
        io?.to(data.roomId).emit('receive-message', data)
      })

      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id)
      })
    })

    // Make io globally available for notification service
    ;(globalThis as any).socketIo = io
    res.socket.server.io = io
  }

  res.end()
}

export default SocketHandler