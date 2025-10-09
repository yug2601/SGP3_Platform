"use client"

import { io, Socket } from "socket.io-client"

class SocketManager {
  private socket: Socket | null = null
  private isConnecting = false

  connect(userId: string): Socket {
    if (this.socket && this.socket.connected) {
      return this.socket
    }

    if (this.isConnecting) {
      return this.socket!
    }

    this.isConnecting = true

    // Connect to Socket.IO server
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
    })

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server:', this.socket?.id)
      this.isConnecting = false
      
      // Join user-specific room for notifications
      if (userId) {
        this.socket?.emit('join-user-room', userId)
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason)
      this.isConnecting = false
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error)
      this.isConnecting = false
    })

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnecting = false
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Notification-specific methods
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('new-notification', callback)
  }

  offNotification(callback: (notification: any) => void) {
    this.socket?.off('new-notification', callback)
  }

  // Join project-specific rooms for chat and updates
  joinProject(projectId: string) {
    this.socket?.emit('join-project', projectId)
  }

  leaveProject(projectId: string) {
    this.socket?.emit('leave-project', projectId)
  }
}

// Export a singleton instance
export const socketManager = new SocketManager()

export default socketManager