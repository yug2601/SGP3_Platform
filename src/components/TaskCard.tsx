"use client"

import { motion } from "@/components/motion"
import { Calendar, AlertCircle, MoreHorizontal, Edit, Trash2, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Modal } from "@/components/Modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useState, memo } from "react"
import type { Task, ProjectMember } from "@/lib/types"

interface TaskCardProps {
  task: Task
  onClick?: () => void
  onUpdate?: (patch: Partial<Task>) => void
  onDelete?: (taskId: string) => void
  canManage?: boolean // Can edit/delete tasks
  projectMembers?: ProjectMember[] // For assignment dropdown
}

const statusColors = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

const priorityColors = {
  low: "text-green-600",
  medium: "text-yellow-600",
  high: "text-red-600",
}

function TaskCardInner({ 
  task, 
  onClick, 
  onUpdate, 
  onDelete, 
  canManage = false, 
  projectMembers = []
}: TaskCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? (() => {
      const date = new Date(task.dueDate)
      return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0]
    })() : '',
    assigneeId: task.assignee?.id || ''
  })

  const handleEdit = () => {
    const updates: Partial<Task> = {
      title: editForm.title,
      description: editForm.description,
      status: editForm.status,
      priority: editForm.priority,
      dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
    }

    if (editForm.assigneeId) {
      const assignee = projectMembers.find(m => m.id === editForm.assigneeId)
      if (assignee) {
        updates.assignee = { id: assignee.id, name: assignee.name, avatar: assignee.avatar }
      }
    } else {
      updates.assignee = undefined
    }

    onUpdate?.(updates)
    setIsEditModalOpen(false)
  }

  const handleDelete = () => {
    onDelete?.(task.id)
    setIsDeleteConfirmOpen(false)
  }

  const handleStatusChange = (status: string) => {
    onUpdate?.({ status: status as Task['status'] })
  }

  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02 }} 
        whileTap={{ scale: 0.98 }} 
        transition={{ duration: 0.2 }}
        className="group h-full"
      >
        <Card className="cursor-pointer transition-shadow hover:shadow-md min-h-[200px] h-full flex flex-col" onClick={onClick}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base font-medium flex-1 pr-2">{task.title}</CardTitle>
              <div className="flex items-center gap-1">
                <AlertCircle className={cn("h-4 w-4", priorityColors[task.priority])} />
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditModalOpen(true)
                        }}
                      >
                        <Edit className="h-3 w-3" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDeleteConfirmOpen(true)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            <span className={cn("inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium", statusColors[task.status])}>
              {task.status.replace("-", " ")}
            </span>
          </CardHeader>
          <CardContent className="pt-0 flex-1 flex flex-col">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{task.description || 'No description'}</p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee?.avatar} />
                  <AvatarFallback className="text-xs">
                    {task.assignee?.name?.split(" ").map(n => n[0]).join("") || <User className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{task.assignee?.name || "Unassigned"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                </div>
                {onUpdate && (
                  <Select value={task.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-20 h-6 text-xs" onClick={(e) => e.stopPropagation()}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Task Modal */}
      {canManage && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Task"
          description="Update task details and assignment."
        >
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Task title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as Task['status'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Priority</label>
                <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value as Task['priority'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Assignee</label>
                <Select value={editForm.assigneeId || "unassigned"} onValueChange={(value) => setEditForm(prev => ({ ...prev, assigneeId: value === "unassigned" ? "" : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {projectMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Due Date</label>
                <Input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEdit}>
                Update Task
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {canManage && (
        <Modal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          title="Delete Task"
          description="This action cannot be undone."
        >
          <div className="space-y-4 py-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                Are you sure you want to delete "<strong>{task.title}</strong>"?
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Task
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export const TaskCard = memo(TaskCardInner)
