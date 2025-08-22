"use client"

import React, { use, useEffect, useMemo, useState } from "react"
import { motion } from "@/components/motion"
import { ArrowLeft, Edit, Archive, Users, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import dynamic from "next/dynamic"
const TaskCard = dynamic(() => import("@/components/TaskCard").then(m => m.TaskCard), { ssr: false })
const ChatMessage = dynamic(() => import("@/components/ChatMessage").then(m => m.ChatMessage), { ssr: false })
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { ProgressiveList } from "@/components/ProgressiveList"
import type { Project, Task, ChatMessageItem } from "@/lib/types"

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "on-hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
}

export default function ProjectDetailPage({ params: paramsPromise }: { params: Promise<{ projectId: string }> }) {
  const params = use(paramsPromise)
  const [activeTab, setActiveTab] = useState("overview")
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [messageInput, setMessageInput] = useState("")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const p = await api<Project>(`/api/projects/${params.projectId}`)
        if (!cancelled) setProject(p)
      } catch { if (!cancelled) setProject(null) }
      try {
        const t = await api<Task[]>(`/api/tasks?projectId=${params.projectId}`)
        if (!cancelled) setTasks(t)
      } catch { if (!cancelled) setTasks([]) }
      try {
        const m = await api<ChatMessageItem[]>(`/api/chat/${params.projectId}`)
        if (!cancelled) setMessages(m)
      } catch { if (!cancelled) setMessages([]) }
    })()
    return () => { cancelled = true }
  }, [params.projectId])

  useEffect(() => {
    // Initialize Socket.IO client for realtime chat
    let socket: any
    ;(async () => {
      try {
        // Ensure server side socket is ready
        await fetch('/api/socketio')
        const { io } = await import('socket.io-client')
        socket = io({ path: '/api/socketio' })
        const room = `project:${params.projectId}`
        socket.emit('join', room)
        socket.on('chat:message', (msg: ChatMessageItem) => {
          if (msg.projectId === params.projectId) {
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
          }
        })
      } catch {}
    })()
    return () => {
      try { socket?.disconnect?.() } catch {}
    }
  }, [params.projectId])

  const completedCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks])

  const sendMessage = React.useCallback(async () => {
    if (!messageInput.trim()) return
    const optimistic: ChatMessageItem = {
      id: Math.random().toString(36).slice(2, 9),
      projectId: params.projectId,
      content: messageInput,
      sender: { id: 'me', name: 'You' },
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setMessageInput("")
    try {
      const created = await api<ChatMessageItem>(`/api/chat/${params.projectId}`, {
        method: 'POST',
        body: JSON.stringify({ content: optimistic.content, sender: optimistic.sender })
      })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? created : m))
      try {
        // also emit realtime event if socket is connected (server will broadcast to room)
        const { io } = await import('socket.io-client')
        const s = io({ path: '/api/socketio' })
        s.emit('chat:send', { projectId: params.projectId, content: created.content, sender: created.sender })
        setTimeout(() => s.disconnect(), 500)
      } catch {}
    } catch {
      // ignore
    }
  }, [messageInput, params.projectId])

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-1/3 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                statusColors[project.status]
              )}
            >
              {project.status}
            </span>
          </div>
          <p className="text-muted-foreground">
            Created on {new Date(project.createdAt).toLocaleDateString()} {project.dueDate && <>• Due {new Date(project.dueDate).toLocaleDateString()}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.members.length}</div>
            <div className="flex -space-x-2 mt-2">
              {project.members.slice(0, 4).map((member, index) => (
                <Avatar key={index} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCount}/{project.tasksCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.max(0, project.tasksCount - completedCount)} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.members.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">Member</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Tasks</h3>
            <Button onClick={() => (window.location.href = `/projects/${project.id}/tasks`)}>Manage</Button>
          </div>
          <div>
            <ProgressiveList
              items={tasks}
              containerClassName="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial={18}
              step={18}
              renderItem={(task, index) => (
                <motion.div
                  key={(task as any).id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TaskCard
                    task={{ ...(task as any), dueDate: (task as any).dueDate ? new Date((task as any).dueDate).toLocaleDateString() : '' } as any}
                    onUpdate={async (patch) => {
                      await api(`/api/tasks/${(task as any).id}`, { method: 'PATCH', body: JSON.stringify(patch) })
                      setTasks(prev => prev.map(t => t.id === (task as any).id ? { ...t, ...patch } as any : t))
                    }}
                  />
                </motion.div>
              )}
            />
            {tasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">File management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={{
                    id: m.id,
                    content: m.content,
                    sender: { name: m.sender.name, avatar: m.sender.avatar },
                    timestamp: new Date(m.timestamp).toLocaleTimeString(),
                    isCurrentUser: m.sender.name === 'You',
                  }} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}