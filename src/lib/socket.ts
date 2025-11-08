"use client"

// Dynamic import to prevent SSR issues
let io: any, Socket: any

class SocketManager {
  private socket: any = null
  private isConnecting = false
  private isClient = false

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.isClient = true
      this.initializeSocket()
    }
  }

  private async initializeSocket() {
    if (!this.isClient) return
    
    try {
      const socketIO = await import("socket.io-client")
      io = socketIO.io
      Socket = socketIO.Socket
    } catch (error) {
      console.error('Failed to import socket.io-client:', error)
    }
  }

  async connect(userId: string): Promise<any> {
    if (!this.isClient || !io) {
      await this.initializeSocket()
    }

    if (!io) {
      console.warn('Socket.IO not available')
      return null
    }

    if (this.socket && this.socket.connected) {
      return this.socket
    }

    if (this.isConnecting) {
      return this.socket
    }

    this.isConnecting = true

    try {
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

      this.socket.on('disconnect', (reason: string) => {
        console.log('Disconnected from Socket.IO server:', reason)
        this.isConnecting = false
      })

      this.socket.on('connect_error', (error: any) => {
        console.error('Socket.IO connection error:', error)
        this.isConnecting = false
      })

      return this.socket
    } catch (error) {
      console.error('Failed to connect socket:', error)
      this.isConnecting = false
      return null
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isConnecting = false
  }

  getSocket(): any {
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