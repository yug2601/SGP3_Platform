"use client"

import { useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { motion } from "@/components/motion"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Upload,
  Download,
  X,
} from "lucide-react"
import type { Task, TaskPriority } from "@/lib/types"
import { Input } from "@/components/ui/input"

const TaskDetailModal = dynamic(() => import("@/components/TaskDetailModal").then(m => m.TaskDetailModal), { ssr: false })

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

interface ProjectCalendarProps {
  projectId: string
  projectName: string
  projectTasks: Task[]
  projectMembers: Array<{id: string, name: string, avatar?: string, role: string}>
  canManageTasks: boolean
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onTaskCreated?: () => void // Callback to refresh tasks after creation
}

export function ProjectCalendar({ 
  projectId, 
  projectName,
  projectTasks, 
  projectMembers, 
  canManageTasks, 
  onTaskCreate,
  onTaskCreated
}: ProjectCalendarProps) {
  const { user } = useUser()
  const [view, setView] = useState<ViewMode>('month')
  const [current, setCurrent] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date())
  
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false)
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([])
  const [selectedTaskDate, setSelectedTaskDate] = useState<Date | undefined>()

  const [qcOpen, setQcOpen] = useState(false)
  const [qc, setQc] = useState({ title: '', assigneeId: '', priority: 'medium' as TaskPriority })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const monthDays = useMemo(() => {
    const start = startOfMonth(current)
    const end = endOfMonth(current)
    const startDayOfWeek = start.getDay()
    const days: Date[] = []
    for (let i = 0; i < startDayOfWeek; i++) { 
      const d = new Date(start); 
      d.setDate(d.getDate() - (startDayOfWeek - i)); 
      days.push(d) 
    }
    for (let d = 1; d <= end.getDate(); d++) { 
      days.push(new Date(current.getFullYear(), current.getMonth(), d)) 
    }
    while (days.length % 7 !== 0 || days.length < 42) { 
      const last = days[days.length - 1]; 
      const next = new Date(last); 
      next.setDate(last.getDate() + 1); 
      days.push(next) 
    }
    return days
  }, [current])

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [selectedDate])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const t of projectTasks) {
      const d = parseISOToLocalDate(t.dueDate)
      if (!d) continue
      const key = toKey(d)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return map
  }, [projectTasks])

  const monthLabel = useMemo(() => current.toLocaleString(undefined, { month: 'long', year: 'numeric' }), [current])

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

  async function quickCreate() {
    if (!qc.title.trim()) return
    
    try {
      const iso = toISODate(selectedDate)
      const newTask = {
        projectId,
        title: qc.title.trim(),
        priority: qc.priority,
        assigneeId: qc.assigneeId || undefined,
        dueDate: iso,
        status: 'todo' as const,
        description: '',
        creatorId: user?.id || 'unknown'
      }
      
      // Create task via API
      await api(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(newTask)
      })
      
      // Call the optional onTaskCreate callback for local updates
      if (onTaskCreate) {
        await onTaskCreate(newTask)
      }
      
      // Call the refresh callback to reload tasks
      if (onTaskCreated) {
        onTaskCreated()
      }
      
      // Reset form and close
      setQc({ title: '', assigneeId: qc.assigneeId, priority: qc.priority })
      setQcOpen(false)
    } catch (error) {
      console.error('Failed to create task:', error)
      // You might want to show a toast notification here
    }
  }

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
    const ics = buildICS(projectTasks)
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-${projectId}-tasks.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function importICS(file: File) {
    const text = await file.text()
    const events = parseICS(text)
    let createdCount = 0
    
    for (const e of events) {
      if (!e.date || !e.summary) continue
      
      try {
        const iso = toISODate(e.date)
        const newTask = {
          projectId,
          title: e.summary,
          priority: 'medium' as const,
          dueDate: iso,
          status: 'todo' as const,
          description: '',
          creatorId: user?.id || 'unknown'
        }
        
        // Create task via API
        await api(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          body: JSON.stringify(newTask)
        })
        
        // Call the optional onTaskCreate callback for local updates
        if (onTaskCreate) {
          await onTaskCreate(newTask)
        }
        
        createdCount++
      } catch (error) {
        console.error('Failed to create task from ICS:', error)
      }
    }
    
    // Call the refresh callback to reload tasks if any were created
    if (createdCount > 0 && onTaskCreated) {
      onTaskCreated()
    }
    
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
        const y = Number(v.slice(0,4)); const m = Number(v.slice(4,6)); const d = Number(v.slice(6,8))
        if (y && m && d) date = new Date(y, m-1, d)
      } else if (line.startsWith('SUMMARY:')) {
        summary = line.slice('SUMMARY:'.length).trim()
      }
    }
    return events
  }

  function DayCell({ day }: { day: Date }) {
    const inCurrentMonth = day.getMonth() === current.getMonth()
    const key = toKey(day)
    const count = tasksByDay.get(key)?.length || 0
    const isToday = isSameDay(day, new Date())
    const isSelected = isSameDay(day, selectedDate)
    
    return (
      <div
        className={[
          "relative min-h-24 h-28 bg-background px-2 py-2 text-left transition-colors",
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
    const selectedKey = toKey(selectedDate)
    const selectedDayTasks = tasksByDay.get(selectedKey) || []
    
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
        
        {selectedDayTasks.length > 0 ? (
          <div className="space-y-3">
            {selectedDayTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="cursor-pointer p-4 bg-card rounded-lg border hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedTasks([task])
                  setSelectedTaskDate(selectedDate)
                  setTaskDetailModalOpen(true)
                }}
              >
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.description || 'No description'}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="capitalize">{task.status.replace('-', ' ')}</span>
                  <span className="capitalize">{task.priority} priority</span>
                  {task.assignee && <span>Assigned to {task.assignee.name}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No tasks scheduled for this day.
            </CardContent>
          </Card>
        )}
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
        <Card>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Project Calendar</h2>
          <p className="text-muted-foreground">View and manage tasks by date</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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

          {canManageTasks && (
            <Button onClick={() => setQcOpen(v => !v)}><Plus className="h-4 w-4 mr-2" />Quick create</Button>
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

      {qcOpen && canManageTasks && (
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Create New Task</h3>
                <Button variant="ghost" size="sm" onClick={() => setQcOpen(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input 
                    placeholder={`Task for ${selectedDate.toLocaleDateString()}`} 
                    value={qc.title} 
                    onChange={(e) => setQc(v => ({ ...v, title: e.target.value }))} 
                    className="w-full h-10"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Assignee</label>
                  <select 
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                    value={qc.assigneeId} 
                    onChange={(e) => setQc(v => ({ ...v, assigneeId: e.target.value }))}
                  >
                    <option value="">Unassigned</option>
                    {projectMembers.filter(m => m.role !== 'member').map(member => (
                      <option key={member.id} value={member.id}>{member.name} ({member.role})</option>
                    ))}
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
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setQcOpen(false)} size="default">
                    Cancel
                  </Button>
                  <Button onClick={quickCreate} size="default" disabled={!qc.title.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'month' ? (
        <MonthView />
      ) : view === 'week' ? (
        <WeekView />
      ) : (
        <DayView />
      )}

      <TaskDetailModal
        isOpen={taskDetailModalOpen}
        onClose={() => setTaskDetailModalOpen(false)}
        tasks={selectedTasks}
        selectedDate={selectedTaskDate}
        projects={[{id: projectId, name: projectName}]}
      />
    </div>
  )
}