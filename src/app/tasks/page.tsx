"use client"

import { useState } from "react"
import { motion } from "@/components/motion"
import { Plus, Search, Filter, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskCard } from "@/components/TaskCard"
import { Modal } from "@/components/Modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockTasks = [
  {
    id: "1",
    title: "Design homepage mockup",
    description: "Create wireframes and high-fidelity mockups for the new homepage design",
    status: "done" as const,
    priority: "high" as const,
    dueDate: "Nov 15",
    assignee: { name: "Jane Smith", avatar: "" },
    project: "Website Redesign"
  },
  {
    id: "2",
    title: "Implement responsive navigation",
    description: "Build mobile-responsive navigation component with hamburger menu",
    status: "in-progress" as const,
    priority: "medium" as const,
    dueDate: "Nov 20",
    assignee: { name: "Mike Johnson", avatar: "" },
    project: "Website Redesign"
  },
  {
    id: "3",
    title: "Set up authentication system",
    description: "Implement user login and registration functionality",
    status: "todo" as const,
    priority: "high" as const,
    dueDate: "Nov 25",
    assignee: { name: "Sarah Wilson", avatar: "" },
    project: "Website Redesign"
  },
  {
    id: "4",
    title: "Design user onboarding flow",
    description: "Create wireframes for the mobile app user onboarding experience",
    status: "in-progress" as const,
    priority: "medium" as const,
    dueDate: "Dec 1",
    assignee: { name: "Lisa Wang", avatar: "" },
    project: "Mobile App Development"
  },
  {
    id: "5",
    title: "API endpoint documentation",
    description: "Document all REST API endpoints with examples and usage",
    status: "todo" as const,
    priority: "low" as const,
    dueDate: "Dec 5",
    assignee: { name: "Alex Chen", avatar: "" },
    project: "API Integration"
  }
]

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.project.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const taskStats = {
    total: mockTasks.length,
    todo: mockTasks.filter(t => t.status === "todo").length,
    inProgress: mockTasks.filter(t => t.status === "in-progress").length,
    done: mockTasks.filter(t => t.status === "done").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Tasks</h1>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="space-y-2">
              <TaskCard task={task} />
              <p className="text-xs text-muted-foreground px-2">
                Project: {task.project}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
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
            <Input placeholder="Enter task title..." className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Task description..." className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Project</label>
            <select className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a project</option>
              <option value="website">Website Redesign</option>
              <option value="mobile">Mobile App Development</option>
              <option value="api">API Integration</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input type="date" className="mt-1" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
