"use client"

import React, { use, useEffect, useMemo, useState } from "react"
import { motion } from "@/components/motion"
import { ArrowLeft, Edit, Archive, Users, Calendar, BarChart3, ChevronDown, Upload, Download, Trash2, Search, SortAsc, SortDesc, File, FileText, Image as ImageIcon, FileVideo, Music, Smile, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import nextDynamic from "next/dynamic"
const TaskCard = nextDynamic(() => import("@/components/TaskCard").then(m => m.TaskCard), { ssr: false })
const ChatMessage = nextDynamic(() => import("@/components/ChatMessage").then(m => m.ChatMessage), { ssr: false })
const ProjectCalendar = nextDynamic(() => import("@/components/ProjectCalendar").then(m => m.ProjectCalendar), { ssr: false })
import { Modal } from "@/components/Modal"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { ProgressiveList } from "@/components/ProgressiveList"
import { getProjectPermissions } from "@/lib/permissions"
import { useAuth, useUser } from "@clerk/nextjs"
import type { Project, Task, ChatMessageItem, ProjectStatus, ProjectFile } from "@/lib/types"

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "on-hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
}

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

export const dynamic = 'force-dynamic'
export default function ProjectDetailPage({ params: paramsPromise }: { params: Promise<{ projectId: string }> }) {
  const params = use(paramsPromise)
  const { user } = useUser()
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [project, setProject] = useState<Project | null>(null)
  const [currentUserName, setCurrentUserName] = useState<string>('You')
  const [tasks, setTasks] = useState<Task[]>([])
  const [messages, setMessages] = useState<ChatMessageItem[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    assigneeId: '',
    dueDate: ''
  })
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [fileSearchTerm, setFileSearchTerm] = useState('')
  const [fileSortBy, setFileSortBy] = useState<'name' | 'uploadedAt' | 'size'>('uploadedAt')
  const [fileSortOrder, setFileSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isUploading, setIsUploading] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const chatMessagesRef = React.useRef<HTMLDivElement>(null)

  // Get current user permissions
  const permissions = project && user ? getProjectPermissions(project, user.id) : null
  const canManageTasks = permissions?.canManageTasks() ?? false

  // Function to load/reload tasks
  const loadTasks = React.useCallback(async () => {
    try {
      const t = await api<Task[]>(`/api/projects/${params.projectId}/tasks`)
      setTasks(t)
    } catch {
      setTasks([])
    }
  }, [params.projectId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const p = await api<Project>(`/api/projects/${params.projectId}`)
        if (!cancelled) setProject(p)
      } catch { if (!cancelled) setProject(null) }
      // Load tasks using the loadTasks function
      if (!cancelled) await loadTasks()
      try {
        const f = await api<ProjectFile[]>(`/api/projects/${params.projectId}/files`)
        if (!cancelled) setFiles(f)
      } catch { if (!cancelled) setFiles([]) }
      try {
        const m = await api<ChatMessageItem[]>(`/api/chat/${params.projectId}`)
        if (!cancelled) setMessages(m)
      } catch { if (!cancelled) setMessages([]) }
      try {
        const me = await api<{ name: string }>(`/api/auth/me`).catch(() => ({ name: 'You' }))
        if (!cancelled) setCurrentUserName(me.name || 'You')
      } catch {}
    })()
    return () => { cancelled = true }
  }, [params.projectId, loadTasks])

  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Real-time chat updates via polling with activity detection
    let isActive = true
    
    const poll = async () => {
      if (!isActive) return
      try {
        const m = await api<ChatMessageItem[]>(`/api/chat/${params.projectId}`)
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
  }, [params.projectId])

  const completedCount = useMemo(() => tasks.filter(t => t.status === 'done').length, [tasks])
  // auto-update project progress based on tasks if available
  useEffect(() => {
    if (!project) return
    const total = tasks.length
    if (total === 0) return
    const done = tasks.filter(t => t.status === 'done').length
    const computed = Math.round((done / total) * 100)
    if (computed !== project.progress) {
      ;(async () => {
        try {
          const updated = await api<Project>(`/api/projects/${project.id}`, { method: 'PATCH', body: JSON.stringify({ progress: computed }) })
          setProject(updated)
        } catch {}
      })()
    }
  }, [tasks, project])

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
    setShowEmojiPicker(false) // Close emoji picker after sending
    try {
      const created = await api<ChatMessageItem>(`/api/chat/${params.projectId}`, {
        method: 'POST',
        body: JSON.stringify({ content: optimistic.content, sender: optimistic.sender })
      })
      setMessages(prev => prev.map(m => m.id === optimistic.id ? created : m))
    } catch {
      // ignore
    }
  }, [messageInput, params.projectId])

  const handleKeyPress = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  const addEmoji = React.useCallback((emoji: string) => {
    setMessageInput(prev => prev + emoji)
    setShowEmojiPicker(false)
  }, [])

  const updateProjectStatus = React.useCallback(async (newStatus: ProjectStatus) => {
    if (!project) return
    try {
      const updated = await api<Project>(`/api/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      })
      setProject(updated)
    } catch {
      // ignore
    }
  }, [project])

  const createTask = React.useCallback(async () => {
    if (!newTask.title.trim() || !canManageTasks) return
    try {
      const token = await getToken()
      const taskData = {
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        assigneeId: newTask.assigneeId || null,
        dueDate: newTask.dueDate || null
      }
      
      const createdTask = await api<Task>(`/api/projects/${project!.id}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      
      setTasks(prev => [createdTask, ...prev])
      setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '', dueDate: '' })
      setIsCreateTaskModalOpen(false)
      
      // Update project task count
      setProject(prev => prev ? { ...prev, tasksCount: prev.tasksCount + 1 } : null)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }, [newTask, canManageTasks, getToken, project])

  const updateTask = React.useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const token = await getToken()
      const updatedTask = await api<Task>(`/api/projects/${project!.id}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      
      setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t))
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }, [getToken, project])

  const deleteTask = React.useCallback(async (taskId: string) => {
    try {
      const token = await getToken()
      await api(`/api/projects/${project!.id}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      
      setTasks(prev => prev.filter(t => t.id !== taskId))
      
      // Update project task count
      setProject(prev => prev ? { ...prev, tasksCount: Math.max(0, prev.tasksCount - 1) } : null)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }, [getToken, project])

  // File management functions
  const handleFileUpload = React.useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = await getToken()
      const response = await fetch(`/api/projects/${project!.id}/files`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) throw new Error('Upload failed')

      const uploadedFile = await response.json() as ProjectFile
      setFiles(prev => [uploadedFile, ...prev])
      
      // Update project files count
      setProject(prev => prev ? { ...prev, filesCount: prev.filesCount + 1 } : null)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setIsUploading(false)
      // Clear file input
      event.target.value = ''
    }
  }, [getToken, project])

  const handleFileDelete = React.useCallback(async (fileId: string) => {
    if (!fileId || fileId === 'undefined') {
      console.error('Invalid file ID:', fileId)
      alert('Cannot delete file: Invalid file ID')
      return
    }

    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const token = await getToken()
      const response = await fetch(`/api/projects/${project!.id}/files/${fileId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`)
      }

      setFiles(prev => prev.filter(f => f.id !== fileId))
      
      // Update project files count
      setProject(prev => prev ? { ...prev, filesCount: Math.max(0, prev.filesCount - 1) } : null)
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }, [getToken, project])

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (mimeType.startsWith('video/')) return <FileVideo className="h-4 w-4" />
    if (mimeType.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (mimeType.includes('text') || mimeType.includes('document')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Filter and sort files
  const filteredAndSortedFiles = React.useMemo(() => {
    const filtered = files.filter(file =>
      file.name.toLowerCase().includes(fileSearchTerm.toLowerCase())
    )

    filtered.sort((a, b) => {
      let comparison = 0
      switch (fileSortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'size':
          comparison = a.size - b.size
          break
        case 'uploadedAt':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
      }
      return fileSortOrder === 'desc' ? -comparison : comparison
    })

    return filtered
  }, [files, fileSearchTerm, fileSortBy, fileSortOrder])

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "inline-flex rounded-full px-4 py-2 text-sm font-medium gap-2",
                    statusColors[project.status]
                  )}
                >
                  {project.status.replace("-", " ")}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => updateProjectStatus('active')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Active
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => updateProjectStatus('completed')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    Completed
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => updateProjectStatus('on-hold')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    On Hold
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-muted-foreground">
            Created on {new Date(project.createdAt).toLocaleDateString()} {project.dueDate && <>• Due {new Date(project.dueDate).toLocaleDateString()}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => {
            const name = prompt('Project name', project.name)
            if (!name) return
            const description = prompt('Description', project.description || '') || ''
            const patch: Partial<Project> = { name, description }
            const updated = await api<Project>(`/api/projects/${project.id}`, { method: 'PATCH', body: JSON.stringify(patch) })
            setProject(updated)
          }}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={async () => {
            if (!confirm('Archive this project? You can restore later via the archived projects section.')) return
            await api(`/api/projects/${project.id}`, { method: 'DELETE' })
            window.location.href = '/projects'
          }}>
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid gap-6 md:grid-cols-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Files</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatFileSize(files.reduce((acc, file) => acc + file.size, 0))} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
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
                {permissions?.canAddRemoveMembers() && (
                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" onClick={async () => {
                      const email = prompt('Invite by email')
                      if (!email) return
                      try {
                        await api(`/api/projects/${project.id}/members`, { method: 'POST', body: JSON.stringify({ email }) })
                        const refreshed = await api<Project>(`/api/projects/${project.id}`)
                        setProject(refreshed)
                      } catch {
                        alert('Failed to add member. Please check permissions and try again.')
                      }
                    }}>Add by Email</Button>
                    <Button variant="outline" onClick={async () => {
                      try {
                        const res = await api<{ inviteCode: string }>(`/api/projects/${project.id}/invite`, { method: 'POST' })
                        navigator.clipboard?.writeText(res.inviteCode).catch(() => {})
                        alert(`Invite code: ${res.inviteCode} (copied)`)
                      } catch {
                        alert('Failed to generate invite code.')
                      }
                    }}>Generate Invite Code</Button>
                    <Button variant="outline" onClick={async () => {
                      const code = prompt('Enter invite code to join this project from another account')
                      if (!code) return
                      alert('Share code with your teammate. They can use /projects -> Join with code UI (coming)')
                    }}>Join by Code</Button>
                  </div>
                )}
                <div className="space-y-3">
                  {[...project.members].sort((a, b) => {
                    // Sort: owner first, current user, then others
                    if (a.id === project.ownerId) return -1
                    if (b.id === project.ownerId) return 1
                    if (a.name === currentUserName) return -1
                    if (b.name === currentUserName) return 1
                    return 0
                  }).map((member, index) => {
                    const isOwner = member.id === project.ownerId
                    const isCurrentUser = member.name === currentUserName
                    const canManageThisMember = permissions?.canAssignRoles() && !isOwner && !isCurrentUser
                    const canRemoveThisMember = permissions?.canAddRemoveMembers() && !isOwner && (
                      permissions?.isLeader() || 
                      (permissions?.isCoLeader() && member.role === 'member') || 
                      isCurrentUser
                    )

                    const roleDisplay = isOwner ? 'Leader (Owner)' : 
                      member.role === 'leader' ? 'Leader' :
                      member.role === 'co-leader' ? 'Co-Leader' : 'Member'
                    
                    return (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.name}
                              {isCurrentUser ? ' (you)' : ''}
                              {isOwner ? ' 👑' : ''}
                            </p>
                            <p className="text-sm text-muted-foreground">{roleDisplay}</p>
                          </div>
                        </div>
                        
                        {(canManageThisMember || canRemoveThisMember) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canManageThisMember && (
                                <>
                                  {member.role !== 'co-leader' && (
                                    <DropdownMenuItem onClick={async () => {
                                      try {
                                        await api(`/api/projects/${project.id}/members/manage`, {
                                          method: 'PATCH',
                                          body: JSON.stringify({ memberId: member.id, role: 'co-leader' })
                                        })
                                        const refreshed = await api<Project>(`/api/projects/${project.id}`)
                                        setProject(refreshed)
                                      } catch {
                                        alert('Failed to update member role.')
                                      }
                                    }}>
                                      Make Co-Leader
                                    </DropdownMenuItem>
                                  )}
                                  {member.role !== 'member' && (
                                    <DropdownMenuItem onClick={async () => {
                                      try {
                                        await api(`/api/projects/${project.id}/members/manage`, {
                                          method: 'PATCH',
                                          body: JSON.stringify({ memberId: member.id, role: 'member' })
                                        })
                                        const refreshed = await api<Project>(`/api/projects/${project.id}`)
                                        setProject(refreshed)
                                      } catch {
                                        alert('Failed to update member role.')
                                      }
                                    }}>
                                      Make Member
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {canRemoveThisMember && (
                                <DropdownMenuItem 
                                  className="text-red-600 dark:text-red-400"
                                  onClick={async () => {
                                    if (!confirm(`Are you sure you want to remove ${member.name} from this project?`)) return
                                    try {
                                      await api(`/api/projects/${project.id}/members/manage`, {
                                        method: 'DELETE',
                                        body: JSON.stringify({ memberId: member.id })
                                      })
                                      const refreshed = await api<Project>(`/api/projects/${project.id}`)
                                      setProject(refreshed)
                                    } catch {
                                      alert('Failed to remove member.')
                                    }
                                  }}
                                >
                                  {isCurrentUser ? 'Leave Project' : 'Remove Member'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Tasks</h3>
            {canManageTasks && (
              <Button onClick={() => setIsCreateTaskModalOpen(true)}>
                Add Task
              </Button>
            )}
          </div>
          <div>
            <ProgressiveList
              items={tasks}
              containerClassName="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              initial={18}
              step={18}
              renderItem={(task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <TaskCard
                    task={task}
                    projectMembers={project.members}
                    canManage={canManageTasks}
                    onUpdate={(patch) => updateTask(task.id, patch)}
                    onDelete={(taskId) => deleteTask(taskId)}
                  />
                </motion.div>
              )}
            />
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tasks yet.</p>
                {canManageTasks && (
                  <Button 
                    onClick={() => setIsCreateTaskModalOpen(true)}
                    className="mt-4"
                  >
                    Create your first task
                  </Button>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <ProjectCalendar
            projectId={project.id}
            projectName={project.name}
            projectTasks={tasks}
            projectMembers={project.members}
            canManageTasks={canManageTasks}
            onTaskCreated={loadTasks}
          />
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Project Files</CardTitle>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      disabled={isUploading}
                      asChild
                    >
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload File'}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Sort Controls */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={fileSearchTerm}
                    onChange={(e) => setFileSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={fileSortBy}
                  onChange={(e) => setFileSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="uploadedAt">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="size">Sort by Size</option>
                </select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFileSortOrder(fileSortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {fileSortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>

              {/* Files List */}
              {filteredAndSortedFiles.length > 0 ? (
                <div className="space-y-3">
                  {filteredAndSortedFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(file.mimeType)}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.size)}</span>
                            <span>
                              Uploaded by {file.uploadedBy.name} on {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            // Properly encode the fileKey for URL
                            const encodedFileKey = encodeURIComponent(file.fileKey)
                            window.open(`/api/files/${encodedFileKey}`, '_blank')
                          }}
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            console.log('Deleting file with ID:', file.id, 'File object:', file)
                            handleFileDelete(file.id)
                          }}
                          className="text-red-600 hover:text-red-700"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {fileSearchTerm ? 'No files match your search.' : 'No files uploaded yet.'}
                  </p>
                  {!fileSearchTerm && (
                    <label htmlFor="file-upload">
                      <Button className="mt-4 cursor-pointer" disabled={isUploading} asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload your first file
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card className="flex flex-col h-[600px]">
            <CardHeader className="flex-shrink-0">
              <CardTitle>Project Chat</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              {/* Messages Area */}
              <div 
                ref={chatMessagesRef}
                className="flex-1 space-y-4 overflow-y-auto pr-2 min-h-0"
                style={{ scrollBehavior: 'smooth' }}
              >
                {messages.length > 0 ? (
                  messages.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChatMessage message={{
                        id: m.id,
                        content: m.content,
                        sender: { name: m.sender.name, avatar: m.sender.avatar },
                        timestamp: new Date(m.timestamp).toLocaleTimeString(),
                        isCurrentUser: m.sender.name === currentUserName || m.sender.name === 'You',
                      }} />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>
              
              {/* Message Input Area */}
              <div className="flex-shrink-0 mt-4 pt-4 border-t">
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
                      placeholder="Type a message... (Press Enter to send)"
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
                    onClick={sendMessage}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateTaskModalOpen}
        onClose={() => {
          setIsCreateTaskModalOpen(false)
          setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '', dueDate: '' })
        }}
        title="Create New Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={newTask.assigneeId}
                onChange={(e) => setNewTask(prev => ({ ...prev, assigneeId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {project?.members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateTaskModalOpen(false)
                setNewTask({ title: '', description: '', priority: 'medium', assigneeId: '', dueDate: '' })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={createTask}
              disabled={!newTask.title.trim()}
            >
              Create Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}