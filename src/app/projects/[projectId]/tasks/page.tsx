"use client"

import { useState } from "react"
import { motion } from "@/components/motion"
import { ArrowLeft, Plus, Filter, Search } from "lucide-react"
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
    assignee: { name: "Jane Smith", avatar: "" }
  },
  {
    id: "2",
    title: "Implement responsive navigation",
    description: "Build mobile-responsive navigation component with hamburger menu",
    status: "in-progress" as const,
    priority: "medium" as const,
    dueDate: "Nov 20",
    assignee: { name: "Mike Johnson", avatar: "" }
  },
  {
    id: "3",
    title: "Set up authentication system",
    description: "Implement user login and registration functionality",
    status: "todo" as const,
    priority: "high" as const,
    dueDate: "Nov 25",
    assignee: { name: "Sarah Wilson", avatar: "" }
  },
  {
    id: "4",
    title: "Create user dashboard",
    description: "Design and implement user dashboard with analytics",
    status: "todo" as const,
    priority: "medium" as const,
    dueDate: "Dec 1",
    assignee: { name: "John Doe", avatar: "" }
  },
  {
    id: "5",
    title: "Optimize database queries",
    description: "Improve performance by optimizing slow database queries",
    status: "in-progress" as const,
    priority: "low" as const,
    dueDate: "Dec 5",
    assignee: { name: "Sarah Wilson", avatar: "" }
  },
  {
    id: "6",
    title: "Write API documentation",
    description: "Document all API endpoints with examples and usage",
    status: "todo" as const,
    priority: "low" as const,
    dueDate: "Dec 10",
    assignee: { name: "Mike Johnson", avatar: "" }
  }
]

export default function ProjectTasksPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === "todo"),
    "in-progress": filteredTasks.filter(task => task.status === "in-progress"),
    done: filteredTasks.filter(task => task.status === "done")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Project Tasks</h1>
          <p className="text-muted-foreground">
            Manage tasks for Website Redesign project
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
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

      {/* Kanban Board */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* To Do Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>To Do</span>
              <span className="text-sm font-normal bg-muted px-2 py-1 rounded">
                {tasksByStatus.todo.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasksByStatus.todo.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
            {tasksByStatus.todo.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No tasks in this column
              </p>
            )}
          </CardContent>
        </Card>

        {/* In Progress Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>In Progress</span>
              <span className="text-sm font-normal bg-muted px-2 py-1 rounded">
                {tasksByStatus["in-progress"].length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasksByStatus["in-progress"].map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
            {tasksByStatus["in-progress"].length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No tasks in this column
              </p>
            )}
          </CardContent>
        </Card>

        {/* Done Column */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Done</span>
              <span className="text-sm font-normal bg-muted px-2 py-1 rounded">
                {tasksByStatus.done.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasksByStatus.done.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
            {tasksByStatus.done.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No tasks in this column
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
        description="Add a new task to this project."
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