"use client"

import React from "react"
import { motion } from "@/components/motion"
import { 
  Calendar, 
  AlertCircle, 
  User, 
  Clock, 
  Circle, 
  PlayCircle, 
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/Modal"
import { cn } from "@/lib/utils"
import type { Task } from "@/lib/types"

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  selectedDate?: Date
  projects?: Array<{id: string, name: string}>
}

const statusColors = {
  todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
}

const priorityColors = {
  low: "text-green-600 bg-green-50 dark:bg-green-950",
  medium: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950", 
  high: "text-red-600 bg-red-50 dark:bg-red-950",
}

const statusIcons = {
  todo: Circle,
  "in-progress": PlayCircle,
  done: CheckCircle,
}

export function TaskDetailModal({
  isOpen,
  onClose,
  tasks,
  selectedDate,
  projects = []
}: TaskDetailModalProps) {
  const dateString = selectedDate ? selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : 'Task Details'

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Tasks for ${dateString}`}
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No tasks scheduled for this day.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => {
              const StatusIcon = statusIcons[task.status]
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            <StatusIcon 
                              className={cn(
                                "h-5 w-5",
                                task.status === 'done' ? "text-green-600" :
                                task.status === 'in-progress' ? "text-blue-600" :
                                "text-gray-400"
                              )}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-medium mb-2">
                              {task.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={cn(
                                "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                                statusColors[task.status]
                              )}>
                                {task.status.replace("-", " ")}
                              </span>
                              <span className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
                                priorityColors[task.priority]
                              )}>
                                <AlertCircle className="h-3 w-3" />
                                {task.priority}
                              </span>
                              {(() => {
                                const project = projects.find(p => p.id === task.projectId)
                                return project && (
                                  <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                    {project.name}
                                  </span>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                        
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {task.description && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {task.description}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee?.avatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignee?.name?.split(" ").map(n => n[0]).join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground">
                            {task.assignee?.name || "Unassigned"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                          </span>
                        </div>
                        
                        {task.createdAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                              Created {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
        
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}