"use client"

import { motion } from "@/components/motion"
import { Calendar, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    status: "todo" | "in-progress" | "done"
    priority: "low" | "medium" | "high"
    dueDate?: string
    assignee?: {
      name: string
      avatar?: string
    }
  }
  onClick?: () => void
  onUpdate?: (patch: Partial<TaskCardProps["task"]>) => void
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

import { memo } from "react"

function TaskCardInner({ task, onClick, onUpdate }: TaskCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={onClick}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-base font-medium">{task.title}</CardTitle>
            <div className="flex items-center gap-1">
              <AlertCircle className={cn("h-4 w-4", priorityColors[task.priority])} />
            </div>
          </div>
          <span className={cn("inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium", statusColors[task.status])}>
            {task.status.replace("-", " ")}
          </span>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{task.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee?.avatar} />
                <AvatarFallback className="text-xs">
                  {task.assignee?.name?.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignee?.name || "Unassigned"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {task.dueDate || "No due"}
              </div>
              {onUpdate && (
                <select aria-label="Status" className="border rounded px-1 py-0.5 bg-background" value={task.status} onChange={(e) => onUpdate({ status: e.target.value as any })}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const TaskCard = memo(TaskCardInner)
