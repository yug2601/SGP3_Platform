"use client"

import { motion } from "@/components/motion"
import { Users, MoreHorizontal, Clock, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    status: "active" | "completed" | "on-hold"
    progress: number
    dueDate: string
    members: Array<{
      name: string
      avatar?: string
    }>
    tasksCount: number
  }
  onClick?: () => void
}

const statusColors = {
  active: {
    bg: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  },
  completed: {
    bg: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
  },
  "on-hold": {
    bg: "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50",
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
  },
}

import { memo } from "react"

function ProjectCardInner({ project, onClick }: ProjectCardProps) {
  const statusConfig = statusColors[project.status]
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }} 
      whileTap={{ scale: 0.98 }} 
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className={cn(
        "cursor-pointer transition-all duration-300 border-0 shadow-md hover:shadow-xl overflow-hidden relative",
        statusConfig.bg
      )}>
        {/* Status indicator line */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          project.status === 'active' && "from-green-400 to-emerald-500",
          project.status === 'completed' && "from-blue-400 to-indigo-500",
          project.status === 'on-hold' && "from-orange-400 to-amber-500"
        )} />
        
        <CardHeader className="pb-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1" onClick={onClick}>
              <CardTitle className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", statusConfig.badge)}>
                  {project.status.replace("-", " ")}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target className="h-3 w-3" />
                  {project.tasksCount} tasks
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white/20"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">Edit Project</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">View Details</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600">Archive Project</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0" onClick={onClick}>
          <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
            {project.description}
          </p>
          
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-foreground">Progress</span>
                <span className="font-bold text-primary">{project.progress}%</span>
              </div>
              <div className="w-full bg-white/50 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-500",
                    project.status === 'active' && "bg-gradient-to-r from-green-400 to-emerald-500",
                    project.status === 'completed' && "bg-gradient-to-r from-blue-400 to-indigo-500",
                    project.status === 'on-hold' && "bg-gradient-to-r from-orange-400 to-amber-500"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
            
            {/* Team and Due Date */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Team</span>
                </div>
                <div className="flex -space-x-2">
                  {project.members.slice(0, 3).map((member, index) => (
                    <Avatar key={index} className="h-7 w-7 border-2 border-white dark:border-gray-800 shadow-sm">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
                        {member.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.members.length > 3 && (
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium text-primary shadow-sm">
                      +{project.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{project.dueDate}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const ProjectCard = memo(ProjectCardInner)
