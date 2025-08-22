import type { NextApiRequest, NextApiResponse } from 'next'
import { Server as IOServer } from 'socket.io'
import type { Server as HTTPServer } from 'http'
import { dbConnect } from '@/lib/db'
import { ChatMessageModel } from '@/lib/models'

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

      socket.on('chat:send', async (payload: { projectId: string, content: string, sender: { id: string, name: string, avatar?: string } }) => {
        try {
          const { projectId, content, sender } = payload || {} as any
          if (!projectId || !content || !sender?.id || !sender?.name) return
          await dbConnect()
          const created = await ChatMessageModel.create({ projectId, content, sender })
          const saved = {
            id: created._id.toString(),
            projectId: created.projectId.toString(),
            content: created.content,
            sender: created.sender,
            timestamp: created.timestamp.toISOString(),
          }
          const room = `project:${projectId}`
          io.to(room).emit('chat:message', saved)
        } catch {
          // ignore
        }
      })
    })
  }
  res.end()
}