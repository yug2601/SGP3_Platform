"use client"

import { useEffect, useMemo, useState, memo, useRef, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { motion } from "@/components/motion"
import { Search, Plus, Hash, Send, Smile, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressiveList } from "@/components/ProgressiveList"
import { ChatMessage } from "@/components/ChatMessage"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Project, ChatMessageItem } from "@/lib/types"

// Popular WhatsApp-like emojis
const popularEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
  '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋',
  '🤝', '👏', '👐', '🙌', '🤲', '🙏', '✍️', '💪', '🦾', '🦿',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '💕', '💖', '💗', '💘', '💝', '💞', '💟', '💯', '💢', '💥'
]

const ProjectRoomItem = memo(function ProjectRoomItem({ p, activeId, onSelect }: { p: Project, activeId: string, onSelect: (id: string) => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
        activeId === p.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
      )}
      onClick={() => onSelect(p.id)}
    >
      <Hash className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{p.name}</p>
        <p className="text-xs text-muted-foreground truncate">{p.description}</p>
      </div>
    </motion.div>
  )
})

export default function ChatPage() {
  const { user } = useUser()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string>('You')
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api<Project[]>("/api/projects").then((p) => {
      setProjects(p)
      if (p[0]) setSelectedProjectId(p[0].id)
    }).catch(() => setProjects([]))
    
    // Get current user name
    api<{ name: string }>("/api/auth/me").then(me => {
      setCurrentUserName(me.name || user?.fullName || 'You')
    }).catch(() => {
      setCurrentUserName(user?.fullName || 'You')
    })
  }, [user])

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!selectedProjectId) return
    api<ChatMessageItem[]>(`/api/chat/${selectedProjectId}`).then(setMessages).catch(() => setMessages([]))
    
    // Real-time updates via polling with activity detection
    let isActive = true
    
    const poll = async () => {
      if (!isActive) return
      try {
        const m = await api<ChatMessageItem[]>(`/api/chat/${selectedProjectId}`)
        setMessages(prev => {
          const hasNewMessages = m.length > prev.length || 
            m.some(msg => !prev.find(p => p.id === msg.id))
          return hasNewMessages ? m : prev
        })
      } catch {}
    }
    
    // Poll immediately when page becomes active
    const handleVisibilityChange = () => {
      isActive = !document.hidden
      if (isActive) poll()
    }
    
    // Start polling
    const interval = setInterval(poll, 15000) // Poll every 15 seconds
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [selectedProjectId])

  useEffect(() => {
    const id = setTimeout(() => setDebounced(searchQuery), 200)
    return () => clearTimeout(id)
  }, [searchQuery])

  const filteredProjects = useMemo(() => {
    const q = debounced.toLowerCase()
    return projects.filter(p => p.name.toLowerCase().includes(q))
  }, [projects, debounced])

  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedProjectId) return
    const optimistic: ChatMessageItem = {
      id: Math.random().toString(36).slice(2, 9),
      projectId: selectedProjectId,
      content: messageInput,
      sender: { id: user?.id || 'me', name: currentUserName },
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setMessageInput("")
    setShowEmojiPicker(false) // Close emoji picker after sending
    try {
      const created = await api<ChatMessageItem>(`/api/chat/${selectedProjectId}`, {
        method: 'POST',
        body: JSON.stringify({ content: optimistic.content, sender: optimistic.sender }),
      })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? created : m))
      // Message sent successfully - polling will pick up updates
    } catch {}
  }, [messageInput, selectedProjectId, user?.id, currentUserName])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const addEmoji = useCallback((emoji: string) => {
    setMessageInput(prev => prev + emoji)
    setShowEmojiPicker(false)
  }, [])

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    // Set loading state immediately for better UX
    setDeletingMessage(messageId)
    
    try {
      await api(`/api/chat/${selectedProjectId}/messages/${messageId}`, {
        method: 'DELETE'
      })
      
      // Remove message from local state immediately for better UX
      setMessages(prev => prev.filter(m => m.id !== messageId))
    } catch (error: any) {
      console.error('Failed to delete message:', error)
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'Failed to delete message. Please try again.'
      alert(`Error: ${errorMessage}`)
    } finally {
      setDeletingMessage(null)
    }
  }, [selectedProjectId])

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Messages</CardTitle>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {/* Projects as Rooms */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <FolderOpen className="h-3 w-3" />
              Projects
            </h3>
            <div className="space-y-1">
              <ProgressiveList
                items={filteredProjects}
                initial={40}
                step={40}
                renderItem={(p) => (
                  <ProjectRoomItem key={(p as any).id} p={p as any} activeId={selectedProjectId} onSelect={setSelectedProjectId} />
                )}
                containerClassName="space-y-1"
              />
              {filteredProjects.length === 0 && (
                <p className="text-sm text-muted-foreground">No projects.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedProject && (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h2 className="font-semibold">{selectedProject.name}</h2>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {selectedProject.description}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col min-h-0 p-4">
              {/* Messages Area */}
              <div 
                ref={chatMessagesRef}
                className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-0"
                style={{ scrollBehavior: 'smooth' }}
              >
                {messages.length > 0 ? (
                  messages.map((m) => {
                    const isCurrentUser = m.sender.name === currentUserName || m.sender.name === 'You' || m.sender.id === user?.id
                    const isDeleting = deletingMessage === m.id
                    
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: isDeleting ? 0.5 : 1, 
                          y: 0,
                          scale: isDeleting ? 0.95 : 1
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "group relative",
                          isDeleting && "pointer-events-none"
                        )}
                      >
                        <div className="relative">
                          <ChatMessage 
                            message={{
                              id: m.id,
                              content: m.content,
                              sender: { name: m.sender.name, avatar: m.sender.avatar },
                              timestamp: new Date(m.timestamp).toLocaleTimeString(),
                              isCurrentUser,
                            }}
                            onShowActions={() => {
                              if (isCurrentUser && !isDeleting) {
                                if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
                                  handleDeleteMessage(m.id)
                                }
                              }
                            }}
                          />
                          
                          {/* Deleting overlay */}
                          {isDeleting && (
                            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 rounded-lg flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
            </CardContent>

            {/* Message Input Area */}
            <div className="border-t p-4">
              {/* Emoji Picker */}
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border max-h-32 overflow-y-auto"
                >
                  <div className="grid grid-cols-10 gap-1">
                    {popularEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        onClick={() => addEmoji(emoji)}
                        className="text-xl hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded transition-colors"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex gap-2 items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex-shrink-0"
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message #${selectedProject.name}... (Press Enter to send)`}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={1}
                    style={{ minHeight: '40px', maxHeight: '120px' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement
                      target.style.height = 'auto'
                      target.style.height = Math.min(target.scrollHeight, 120) + 'px'
                    }}
                  />
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Shift+Enter for new line
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
