"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "@/components/motion"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  Upload,
  Download,
  X,
} from "lucide-react"
import { api } from "@/lib/api"
import type { Project, Task, TaskPriority, TaskStatus } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { TaskCard } from "@/components/TaskCard"
import { TaskDetailModal } from "@/components/TaskDetailModal"

type ViewMode = 'month' | 'week' | 'day'

function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1) }
function endOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0) }
function addMonths(date: Date, months: number) { const d = new Date(date); d.setMonth(d.getMonth() + months); return d }
function addDays(date: Date, days: number) { const d = new Date(date); d.setDate(d.getDate() + days); return d }
function startOfWeek(date: Date) { const d = new Date(date); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d }

function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
function toKey(date: Date) { const y = date.getFullYear(); const m = String(date.getMonth() + 1).padStart(2, '0'); const d = String(date.getDate()).padStart(2, '0'); return `${y}-${m}-${d}` }
function parseISOToLocalDate(iso?: string): Date | null { if (!iso) return null; const d = new Date(iso); if (isNaN(d.getTime())) return null; return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function toISODate(date: Date) { const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); return d.toISOString() }

export default function CalendarPage() {
  const { user } = useUser()
  const [view, setView] = useState<ViewMode>('month')
  const [current, setCurrent] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all')
  const [projectFilter, setProjectFilter] = useState<'all' | string>('all')

  // Quick create
  const [qcOpen, setQcOpen] = useState(false)
  const [qc, setQc] = useState({ title: '', projectId: '', assigneeId: '', priority: 'medium' as TaskPriority })

  // User permissions check
  const [userPermissions, setUserPermissions] = useState<{canCreateTasks: boolean, userId?: string}>({canCreateTasks: false})

  // ICS import/export helpers
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Task detail modal
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])
  const [selectedTaskDate, setSelectedTaskDate] = useState<Date | undefined>()

  useEffect(() => {
    let ignore = false
    async function load() {
      setLoading(true)
      try {
        const [t, p] = await Promise.all([
          api<Task[]>("/api/tasks"),
          api<Project[]>("/api/projects"),
        ])
        if (!ignore) { setTasks(t); setProjects(p) }
        
        // Check user permissions for quick create
        try {
          const userInfo = await api<{userId: string, name: string}>("/api/auth/me")
          
          // Use API response or fallback to Clerk user ID
          const userId = userInfo?.userId || user?.id
          
          if (userId) {
            setUserPermissions({canCreateTasks: false, userId: userId})
          } else {
            setUserPermissions({canCreateTasks: false})
          }
        } catch (error) {
          console.error('Failed to get user info:', error)
          // Fallback to Clerk user ID if API fails
          const userId = user?.id
          if (userId) {
            setUserPermissions({canCreateTasks: false, userId: userId})
          } else {
            setUserPermissions({canCreateTasks: false})
          }
        }
      } catch {
      } finally { if (!ignore) setLoading(false) }
    }
    load()
    return () => { ignore = true }
  }, [user]) // Add user as dependency

  const projectNameById = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p.name])), [projects])

  // Check if user can create tasks for currently selected project
  const canCreateForSelectedProject = useMemo(() => {
    if (projectFilter === 'all' || !userPermissions.userId) {
      return false
    }
    
    const selectedProject = projects.find(p => p.id === projectFilter)
    if (!selectedProject) {
      return false
    }
    
    const isOwner = selectedProject.ownerId === userPermissions.userId
    const isLeader = selectedProject.members.some(member => 
      member.id === userPermissions.userId && 
      (member.role === 'leader' || member.role === 'co-leader')
    )
    
    return isOwner || isLeader
  }, [projectFilter, projects, userPermissions.userId])

  // Apply filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false
      return true
    })
  }, [tasks, statusFilter, priorityFilter, projectFilter])

  // Month view grid
  const monthDays = useMemo(() => {
    const start = startOfMonth(current)
    const end = endOfMonth(current)
    const startDayOfWeek = start.getDay()
    const days: Date[] = []
    for (let i = 0; i < startDayOfWeek; i++) { const d = new Date(start); d.setDate(d.getDate() - (startDayOfWeek - i)); days.push(d) }
    for (let d = 1; d <= end.getDate(); d++) { days.push(new Date(current.getFullYear(), current.getMonth(), d)) }
    while (days.length % 7 !== 0 || days.length < 42) { const last = days[days.length - 1]; const next = new Date(last); next.setDate(last.getDate() + 1); days.push(next) }
    return days
  }, [current])

  // Week/day helpers
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [selectedDate])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of filteredTasks) {
      const d = parseISOToLocalDate(t.dueDate)
      if (!d) continue
      const key = toKey(d)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [filteredTasks])

  const selectedKey = toKey(selectedDate)
  const selectedDayTasks = tasksByDay.get(selectedKey) || []

  const monthLabel = useMemo(() => current.toLocaleString(undefined, { month: 'long', year: 'numeric' }), [current])

  // Navigation by view
  function goPrev() {
    if (view === 'month') setCurrent(c => addMonths(c, -1))
    else if (view === 'week') setSelectedDate(d => addDays(d, -7))
    else setSelectedDate(d => addDays(d, -1))
  }
  function goNext() {
    if (view === 'month') setCurrent(c => addMonths(c, 1))
    else if (view === 'week') setSelectedDate(d => addDays(d, 7))
    else setSelectedDate(d => addDays(d, 1))
  }
  function goToday() {
    const now = new Date()
    if (view === 'month') setCurrent(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelectedDate(now)
  }

  // Drag & Drop
  function onDragStartTask(ev: React.DragEvent, task: Task) {
    ev.dataTransfer.setData('text/task-id', task.id)
  }
  async function onDayDrop(ev: React.DragEvent, date: Date) {
    const taskId = ev.dataTransfer.getData('text/task-id')
    if (!taskId) return
    const iso = toISODate(date)
    await api(`/api/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify({ dueDate: iso }) })
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate: iso } as Task : t))
  }

  // Quick create
  async function quickCreate() {
    if (!qc.title.trim() || !qc.projectId) return
    
    try {
      const iso = toISODate(selectedDate)
      const taskData = {
        projectId: qc.projectId,
        title: qc.title.trim(),
        priority: qc.priority,
        assigneeId: qc.assigneeId || undefined,
        dueDate: iso,
        status: 'todo',
        description: '',
        creatorId: user?.id || 'unknown'
      }
      
      // Use the project-specific endpoint for consistency
      const created = await api<Task>(`/api/projects/${qc.projectId}/tasks`, { 
        method: 'POST', 
        body: JSON.stringify(taskData)
      })
      
      // Update local state
      setTasks(prev => [created, ...prev])
      setQc({ title: '', projectId: qc.projectId, assigneeId: qc.assigneeId, priority: qc.priority })
      setQcOpen(false)
    } catch (error) {
      console.error('Failed to create task:', error)
      // You might want to show a toast notification here
    }
  }

  // ICS Export (all-day events from filtered tasks)
  function buildICS(tasks: Task[]): string {
    const lines: string[] = []
    lines.push('BEGIN:VCALENDAR')
    lines.push('VERSION:2.0')
    lines.push('PRODID:-//TogetherFlow//Calendar//EN')
    for (const t of tasks) {
      if (!t.dueDate) continue
      const d = new Date(t.dueDate)
      const dt = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
      const summary = t.title.replace(/\n/g, ' ')
      lines.push('BEGIN:VEVENT')
      lines.push(`UID:${t.id}@togetherflow`)
      lines.push(`DTSTAMP:${dt}T000000Z`)
      lines.push(`DTSTART;VALUE=DATE:${dt}`)
      lines.push(`SUMMARY:${summary}`)
      lines.push('END:VEVENT')
    }
    lines.push('END:VCALENDAR')
    return lines.join('\r\n')
  }
  function exportICS() {
    const ics = buildICS(filteredTasks)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'togetherflow-tasks.ics'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ICS Import (very basic DTSTART + SUMMARY parser). Creates tasks into selected project.
  async function importICS(file: File) {
    const targetProjectId = projectFilter !== 'all' && projectFilter !== 'ics' ? projectFilter : null
    if (!targetProjectId) {
      alert('Please select a specific project from the filter to import ICS tasks into.')
      return
    }
    const text = await file.text()
    const events = parseICS(text)
    const created: Task[] = []
    for (const e of events) {
      if (!e.date || !e.summary) continue
      const iso = toISODate(e.date)
      try {
        const t = await api<Task>("/api/tasks", { method: 'POST', body: JSON.stringify({
          projectId: targetProjectId,
          title: e.summary,
          priority: 'medium',
          dueDate: iso,
        }) })
        created.push(t)
      } catch {}
    }
    if (created.length) setTasks(prev => [...created, ...prev])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  function parseICS(text: string): { date: Date | null; summary: string | null }[] {
    const events: { date: Date | null; summary: string | null }[] = []
    const lines = text.split(/\r?\n/)
    let inEvent = false
    let date: Date | null = null
    let summary: string | null = null
    for (const line of lines) {
      if (line.startsWith('BEGIN:VEVENT')) { inEvent = true; date = null; summary = null; continue }
      if (line.startsWith('END:VEVENT')) { if (inEvent) events.push({ date, summary }); inEvent = false; continue }
      if (!inEvent) continue
      if (line.startsWith('DTSTART')) {
        const v = line.split(':')[1]?.trim() || ''
        // Formats: YYYYMMDD or YYYYMMDDT...
        const y = Number(v.slice(0,4)); const m = Number(v.slice(4,6)); const d = Number(v.slice(6,8))
        if (y && m && d) date = new Date(y, m-1, d)
      } else if (line.startsWith('SUMMARY:')) {
        summary = line.slice('SUMMARY:'.length).trim()
      }
    }
    return events
  }

  // Render helpers
  function DayCell({ day }: { day: Date }) {
    const inCurrentMonth = day.getMonth() === current.getMonth()
    const key = toKey(day)
    const count = tasksByDay.get(key)?.length || 0
    const isToday = isSameDay(day, new Date())
    const isSelected = isSameDay(day, selectedDate)
    return (
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDayDrop(e, day)}
        className={["relative min-h-24 h-28 bg-background px-2 py-2 text-left transition-colors",
          !inCurrentMonth ? "text-muted-foreground/50" : "",
          isSelected ? "ring-2 ring-primary/60 z-10" : "",
          "hover:bg-accent/50 cursor-pointer"
        ].join(' ')}
        onClick={() => {
          setSelectedDate(new Date(day))
          const dayTasks = tasksByDay.get(toKey(day)) || []
          setSelectedTasks(dayTasks)
          setSelectedTaskDate(new Date(day))
          if (dayTasks.length > 0) {
            setTaskDetailModalOpen(true)
          }
        }}
      >
        <div className="flex items-center justify-between">
          <span className={["text-sm font-medium", isToday ? "text-primary" : ""].join(' ')}>{day.getDate()}</span>
          {isToday && (<span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Today</span>)}
        </div>
        {count > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <div className="flex -space-x-1">
              {Array.from({ length: Math.min(3, count) }).map((_, i) => (
                <span key={i} className="inline-block h-2.5 w-2.5 rounded-full bg-primary/70 border border-background" />
              ))}
            </div>
            <span className="text-muted-foreground">{count} task{count > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    )
  }

  function DayList({ date }: { date: Date }) {
    const items = tasksByDay.get(toKey(date)) || []
    return (
      <div className="space-y-3">
        {items.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No tasks due on this day.</CardContent></Card>
        ) : items.map((task, index) => (
          <motion.div
            key={task.id}
            draggable
            onDragStart={(e: React.DragEvent) => onDragStartTask(e, task)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="cursor-pointer"
            onClick={() => {
              setSelectedTasks([task])
              setSelectedTaskDate(date)
              setTaskDetailModalOpen(true)
            }}
          >
            <TaskCard
              task={{ ...task, dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '' } as any}
              onUpdate={async (patch) => {
                await api(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify(patch) })
                setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...patch } as any : t))
              }}
            />
            <p className="text-xs text-muted-foreground px-2 mt-1">Project: {projectNameById[task.projectId] || '—'}</p>
          </motion.div>
        ))}
      </div>
    )
  }

  function WeekView() {
    const days = weekDays
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 text-xs uppercase text-muted-foreground">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
            <div key={d} className="px-2 py-2">{d} <span className="ml-1 text-foreground/70">{days[i].getDate()}</span></div>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px bg-border min-h-64">
              {days.map((d, idx) => {
                const dayTasks = tasksByDay.get(toKey(d)) || []
                return (
                  <div 
                    key={idx} 
                    onDragOver={(e) => e.preventDefault()} 
                    onDrop={(e) => onDayDrop(e, d)} 
                    className="bg-background p-2 min-h-32 cursor-pointer hover:bg-accent/30 transition-colors"
                    onClick={() => {
                      setSelectedDate(new Date(d))
                      setSelectedTasks(dayTasks)
                      setSelectedTaskDate(new Date(d))
                      setTaskDetailModalOpen(true)
                    }}
                  >
                    <div className="mb-2 font-medium text-sm text-center">
                      {d.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="text-xs p-1 bg-primary/10 rounded truncate">
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  function DayView() {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selected day</p>
                <h2 className="text-xl font-semibold">
                  {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <DayList date={selectedDate} />
      </div>
    )
  }

  function MonthView() {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 text-xs uppercase text-muted-foreground">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="px-2 py-2">{d}</div>
          ))}
        </div>
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-px bg-border">
              {monthDays.map((day, idx) => (
                <DayCell key={idx} day={day} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">Month/Week/Day views with quick-create, drag-to-reschedule, filters, and ICS import/export.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" /> Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-56">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
                <div className="grid grid-cols-2 gap-2">
                  {(['all','todo','in-progress','done'] as const).map(s => (
                    <Button key={s} variant={statusFilter===s? 'default':'outline'} size="sm" onClick={() => setStatusFilter(s as any)}>{s}</Button>
                  ))}
                </div>
              </div>
              <div className="px-3 py-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Priority</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['all','low','medium','high'] as const).map(p => (
                    <Button key={p} variant={priorityFilter===p? 'default':'outline'} size="sm" onClick={() => setPriorityFilter(p as any)}>{p}</Button>
                  ))}
                </div>
              </div>
              <div className="px-3 py-2 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Project</p>
                <select className="w-full px-2 py-1 rounded-md border bg-background" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value as any)}>
                  <option value="all">All projects</option>
                  {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  <option value="ics">Imported ICS Calendar</option>
                </select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden sm:flex items-center gap-2">
            <Button variant={view==='month'? 'default':'outline'} onClick={() => setView('month')}>Month</Button>
            <Button variant={view==='week'? 'default':'outline'} onClick={() => setView('week')}>Week</Button>
            <Button variant={view==='day'? 'default':'outline'} onClick={() => setView('day')}>Day</Button>
          </div>

          <Button variant="outline" onClick={goToday}>Today</Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Previous" onClick={goPrev}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" aria-label="Next" onClick={goNext}><ChevronRight className="h-4 w-4" /></Button>
          </div>

          {canCreateForSelectedProject && (
            <Button onClick={() => { 
              setQc(prev => ({ 
                ...prev, 
                projectId: projectFilter !== 'all' ? projectFilter : '' 
              }))
              setQcOpen(true) 
            }}><Plus className="h-4 w-4 mr-2" />Quick create</Button>
          )}

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Import ICS</Button>
            <input ref={fileInputRef} type="file" accept=".ics,text/calendar" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) importICS(f)
            }} />
            <Button variant="outline" onClick={exportICS}><Download className="h-4 w-4 mr-2" />Export ICS</Button>
          </div>
        </div>
      </div>

      {/* Month/Week label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          {view==='month' ? <span>{monthLabel}</span> : view==='week' ? (
            <span>Week of {startOfWeek(selectedDate).toLocaleDateString()}</span>
          ) : (
            <span>{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          )}
        </div>
      </div>

      {/* Quick create panel */}
      {qcOpen && canCreateForSelectedProject && (
        <Card className="w-full max-w-6xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Create New Task</h3>
                <Button variant="ghost" size="sm" onClick={() => setQcOpen(false)} className="h-8 w-8 p-0 flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input 
                    placeholder={`Task for ${selectedDate.toLocaleDateString()}`} 
                    value={qc.title} 
                    onChange={(e) => setQc(v => ({ ...v, title: e.target.value }))}
                    className="h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Project</label>
                  <select 
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                    value={qc.projectId} 
                    onChange={(e) => setQc(v => ({ ...v, projectId: e.target.value }))}
                  >
                    <option value="">Select project</option>
                    {projects.filter(p => {
                      // Show projects where user is owner, leader, or co-leader
                      return p.ownerId === userPermissions.userId || p.members.some(m => 
                        m.id === userPermissions.userId && (m.role === 'leader' || m.role === 'co-leader')
                      )
                    }).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assign To</label>
                  <select 
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                    value={qc.assigneeId} 
                    onChange={(e) => setQc(v => ({ ...v, assigneeId: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {qc.projectId && projects.find(p => p.id === qc.projectId)?.members
                      .filter(m => m.role !== 'member')
                      .map(member => (<option key={member.id} value={member.id}>{member.name} ({member.role})</option>))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <select 
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                    value={qc.priority} 
                    onChange={(e) => setQc(v => ({ ...v, priority: e.target.value as TaskPriority }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Due date: {selectedDate.toLocaleDateString()}
                  </span>
                </div>
                <Button 
                  onClick={quickCreate} 
                  disabled={!qc.title.trim() || !qc.projectId}
                  className="w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main content per view */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />))}
        </div>
      ) : view === 'month' ? (
        <MonthView />
      ) : view === 'week' ? (
        <WeekView />
      ) : (
        <DayView />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={taskDetailModalOpen}
        onClose={() => setTaskDetailModalOpen(false)}
        tasks={selectedTasks}
        selectedDate={selectedTaskDate}
        projects={projects.map(p => ({id: p.id, name: p.name}))}
      />
    </div>
  )
}