"use client"

// Simplified Socket.IO manager for Vercel compatibility
class SocketManager {
  private isClient = false
  private socketUrl = ''
  private eventListeners: { [key: string]: Array<(data: any) => void> } = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.isClient = true
      this.socketUrl = process.env.NODE_ENV === 'production' 
        ? `${window.location.origin}/api/socketio`
        : 'http://localhost:3000/api/socketio'
    }
  }

  async connect(): Promise<boolean> {
    if (!this.isClient) return false

    try {
      // Test connection to the socket endpoint
      const response = await fetch(this.socketUrl)
      if (response.ok) {
        console.log('Socket connection established (polling mode)')
        return true
      }
    } catch (error) {
      console.error('Socket connection failed:', error)
    }
    return false
  }

  disconnect() {
    console.log('Socket disconnected')
    this.eventListeners = {}
  }

  getSocket(): any {
    return {
      connected: this.isClient,
      emit: this.emit.bind(this),
      on: this.on.bind(this),
      off: this.off.bind(this)
    }
  }

  isConnected(): boolean {
    return this.isClient
  }

  // Simplified event system
  on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(callback)
  }

  off(event: string, callback: (data: any) => void) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback)
    }
  }

  emit(event: string, data: any) {
    // For now, just log the event (in production, you'd send to server)
    console.log('Socket emit:', event, data)
    
    // Simulate sending to server
    if (this.isClient) {
      fetch(this.socketUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, data })
      }).catch(console.error)
    }
  }

  // Notification-specific methods
  onNotification(callback: (notification: any) => void) {
    this.on('new-notification', callback)
  }

  offNotification(callback: (notification: any) => void) {
    this.off('new-notification', callback)
  }

  // Join project-specific rooms for chat and updates
  joinProject(projectId: string) {
    this.emit('join-project', projectId)
  }

  leaveProject(projectId: string) {
    this.emit('leave-project', projectId)
  }
}

// Export a singleton instance
export const socketManager = new SocketManager()

export default socketManager