import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!res.socket || !(res.socket as any).server) {
    res.status(500).json({ error: 'Socket server not available' })
    return
  }
  const server: HTTPServer & { io?: IOServer } = (res.socket as any).server
  if (!server.io) {
    const io = new IOServer(server, {
      path: '/api/socketio',
      cors: { origin: '*'},
    })
    server.io = io

    io.on('connection', (socket) => {
      socket.on('join', (room: string) => {
        try { socket.join(room) } catch {}
      })

      // Broadcast a message to all clients in the project's room.
      // The client should already have persisted the message via REST.
      socket.on('chat:broadcast', (message: { id: string, projectId: string, content: string, sender: { id: string, name: string, avatar?: string }, timestamp: string }) => {
        try {
          if (!message?.projectId || !message?.id || !message?.content || !message?.sender?.id || !message?.sender?.name || !message?.timestamp) return
          const room = `project:${message.projectId}`
          io.to(room).emit('chat:message', message)
        } catch {
          // ignore
        }
      })
    })
  }
  res.end()
}