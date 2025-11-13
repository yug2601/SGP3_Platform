"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "@/components/motion"
import { Plus, Search, Filter, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressiveList } from "@/components/ProgressiveList"
import dynamic from "next/dynamic"
const TaskCard = dynamic(() => import("@/components/TaskCard").then(m => m.TaskCard), { ssr: false })
import { Modal } from "@/components/Modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api"
import type { Project, Task } from "@/lib/types"
import { useToast } from "@/components/ui/toast"

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const projectNameById = useMemo(() => Object.fromEntries(projects.map(p => [p.id, p.name])), [projects])
  const [loading, setLoading] = useState(false)
  const [newTask, setNewTask] = useState({ title: "", description: "", projectId: "", priority: "medium", dueDate: "" })
  const { show, Toast } = useToast()

  async function load() {
    setLoading(true)
    try {
      const [t, p] = await Promise.all([
        api<Task[]>("/api/tasks"),
        api<Project[]>("/api/projects"),
      ])
      setTasks(t)
      setProjects(p)
    } catch {
      // ignore for now
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // debounce search to keep typing smooth
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), 200)
    return () => clearTimeout(id)
  }, [searchQuery])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = debouncedQuery.toLowerCase()
      const matchesSearch = task.title.toLowerCase().includes(q) || (task.description || '').toLowerCase().includes(q)
      const matchesStatus = filterStatus === "all" || task.status === filterStatus
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, debouncedQuery, filterStatus, filterPriority])

  const taskStats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    done: tasks.filter(t => t.status === "done").length,
  }), [tasks])

  async function createTask() {
    if (!newTask.title.trim() || !newTask.projectId) return
    try {
      const created = await api<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId: newTask.projectId,
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: "todo",
          dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        }),
      })
      setTasks(prev => [created, ...prev])
      setIsCreateModalOpen(false)
      setNewTask({ title: "", description: "", projectId: "", priority: "medium", dueDate: "" })
      show("Task created")
    } catch {
      show("Failed to create task")
    }
  }

  return (
    <div className="space-y-6">
      <Toast />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">All Tasks</h1>
          <p className="text-muted-foreground">
            Manage all your tasks across projects
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Task Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">To Do</p>
                <p className="text-2xl font-bold text-gray-600">{taskStats.todo}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{taskStats.done}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("todo")}>
                    To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("in-progress")}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("done")}>
                    Done
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Priority
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterPriority("all")}>
                    All Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("high")}>
                    High
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("medium")}>
                    Medium
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterPriority("low")}>
                    Low
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          <ProgressiveList
            items={filteredTasks}
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
                <div className="space-y-2">
                  <TaskCard
                    task={{
                      ...(task as any),
                      dueDate: (task as any).dueDate ? new Date((task as any).dueDate).toLocaleDateString() : '',
                    } as any}
                    onUpdate={async (patch) => {
                      await api(`/api/tasks/${(task as any).id}`, { method: 'PATCH', body: JSON.stringify(patch) })
                      setTasks(prev => prev.map(t => t.id === (task as any).id ? { ...t, ...patch } as any : t))
                    }}
                  />
                  <p className="text-xs text-muted-foreground px-2">
                    Project: {(task as any).projectName || projectNameById[(task as any).projectId] || '—'}
                  </p>
                </div>
              </motion.div>
            )}
          />
        </div>
      )}

      {!loading && filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks found matching your criteria.</p>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        description="Add a new task to any project."
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Task Title</label>
            <Input
              placeholder="Enter task title..."
              className="mt-1"
              value={newTask.title}
              onChange={(e) => setNewTask(t => ({ ...t, title: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="Task description..."
              className="mt-1"
              value={newTask.description}
              onChange={(e) => setNewTask(t => ({ ...t, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Project</label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTask.projectId}
              onChange={(e) => setNewTask(t => ({ ...t, projectId: e.target.value }))}
            >
              <option value="">Select a project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select
                className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newTask.priority}
                onChange={(e) => setNewTask(t => ({ ...t, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                className="mt-1"
                value={newTask.dueDate}
                onChange={(e) => setNewTask(t => ({ ...t, dueDate: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTask}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
