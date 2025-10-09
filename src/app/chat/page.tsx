"use client"

import { useEffect, useMemo, useState, memo } from "react"
import { useUser } from "@clerk/nextjs"
import { motion } from "@/components/motion"
import { Search, Plus, Hash, Send, Smile, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressiveList } from "@/components/ProgressiveList"
import dynamic from "next/dynamic"
const ChatMessage = dynamic(() => import("@/components/ChatMessage").then(m => m.ChatMessage), { ssr: false })
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import type { Project, ChatMessageItem } from "@/lib/types"

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

  useEffect(() => {
    api<Project[]>("/api/projects").then((p) => {
      setProjects(p)
      if (p[0]) setSelectedProjectId(p[0].id)
    }).catch(() => setProjects([]))
  }, [])

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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedProjectId) return
    const optimistic: ChatMessageItem = {
      id: Math.random().toString(36).slice(2, 9),
      projectId: selectedProjectId,
      content: messageInput,
      sender: { id: user?.id || 'me', name: user?.fullName || 'You' },
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setMessageInput("")
    try {
      const created = await api<ChatMessageItem>(`/api/chat/${selectedProjectId}`, {
        method: 'POST',
        body: JSON.stringify({ content: optimistic.content, sender: optimistic.sender }),
      })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? created : m))
      // Message sent successfully - polling will pick up updates
    } catch {}
  }

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

            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={{
                    id: m.id,
                    content: m.content,
                    sender: { name: m.sender.name, avatar: m.sender.avatar },
                    timestamp: new Date(m.timestamp).toLocaleTimeString(),
                    isCurrentUser: (user?.fullName || 'You') === m.sender.name,
                  }} />
                ))}
                {messages.length === 0 && (
                  <p className="text-sm text-muted-foreground">No messages yet.</p>
                )}
              </div>
            </CardContent>

            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`Message #${selectedProject.name}`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button size="icon" variant="ghost">
                  <Smile className="h-4 w-4" />
                </Button>
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
