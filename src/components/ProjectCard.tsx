"use client"

import { motion } from "@/components/motion"
import { Users, MoreHorizontal, Clock, Target, Edit, Eye, Archive, RotateCcw, Trash2 } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useState, memo } from "react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { useAuth } from "@clerk/nextjs"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
  onClick?: () => void
  onProjectUpdated?: (project: Project) => void
  onProjectArchived?: (projectId: string) => void
  showArchived?: boolean
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

function ProjectCardInner({ project, onClick, onProjectUpdated, onProjectArchived, showArchived = false }: ProjectCardProps) {
  const { getToken } = useAuth()
  const { show } = useToast()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description
  })
  const [isUpdating, setIsUpdating] = useState(false)
  
  const statusConfig = statusColors[project.status]

  const handleEdit = async () => {
    if (!editForm.name.trim()) {
      show("Project name is required")
      return
    }
    
    setIsUpdating(true)
    try {
      const token = await getToken()
      const updatedProject = await api<Project>(`/api/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim()
        }),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      
      onProjectUpdated?.(updatedProject)
      setIsEditModalOpen(false)
      show("Project updated successfully")
    } catch {
      show("Failed to update project")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleArchive = async () => {
    setIsUpdating(true)
    try {
      const token = await getToken()
      await api(`/api/projects/${project.id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      
      onProjectArchived?.(project.id)
      show("Project archived successfully")
    } catch {
      show("Failed to archive project")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRestore = async () => {
    setIsUpdating(true)
    try {
      const token = await getToken()
      const updatedProject = await api<Project>(`/api/projects/${project.id}`, {
        method: "PATCH",
        body: JSON.stringify({ archived: false }),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      
      onProjectUpdated?.(updatedProject)
      show("Project restored successfully")
    } catch {
      show("Failed to restore project")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    setIsUpdating(true)
    try {
      const token = await getToken()
      // Permanently delete the project (different from archive)
      await api(`/api/projects/${project.id}/delete`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      
      onProjectArchived?.(project.id) // Use same callback for removal from UI
      show("Project deleted permanently")
    } catch {
      show("Failed to delete project")
    } finally {
      setIsUpdating(false)
      setIsDeleteConfirmOpen(false)
    }
  }
  
  return (
    <>
      <motion.div 
        whileHover={{ scale: 1.02, y: -4 }} 
        whileTap={{ scale: 0.98 }} 
        transition={{ duration: 0.2 }}
        className="group h-full"
      >
        <Card className={cn(
          "cursor-pointer transition-all duration-300 border-0 shadow-md hover:shadow-xl overflow-hidden relative min-h-[320px] h-full flex flex-col",
          statusConfig.bg,
          showArchived && "opacity-75"
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
                  {showArchived && <span className="text-sm text-muted-foreground ml-2">(Archived)</span>}
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
                  {!showArchived ? (
                    <>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditForm({ name: project.name, description: project.description })
                          setIsEditModalOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDetailsModalOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2 text-orange-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleArchive()
                        }}
                      >
                        <Archive className="h-4 w-4" />
                        Archive Project
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2 text-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDeleteConfirmOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem 
                      className="cursor-pointer flex items-center gap-2 text-green-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestore()
                      }}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Restore Project
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 flex-1 flex flex-col" onClick={onClick}>
            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
            
            <div className="space-y-4 mt-auto">
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
                  <span className="font-medium">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
        description="Update your project details."
      >
        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Project Name</label>
            <Input
              placeholder="Enter project name..."
              className="h-12 border-0 bg-muted/50 focus:bg-white dark:focus:bg-white/20 transition-all duration-200 rounded-xl"
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
            <Textarea
              placeholder="Brief description..."
              className="min-h-24 border-0 bg-muted/50 focus:bg-white dark:focus:bg-white/20 transition-all duration-200 rounded-xl"
              value={editForm.description}
              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              className="border-0 bg-muted/50 hover:bg-muted transition-all duration-200"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEdit}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Project"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Project Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Project Details"
        description={`Complete information about ${project.name}.`}
      >
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Project Name</label>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-xl">{project.name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Status</label>
              <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-semibold", statusConfig.badge)}>
                {project.status.replace("-", " ")}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
            <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-xl min-h-20">
              {project.description || "No description provided"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Team Members</label>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-xl">
                {project.members.length} member{project.members.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Progress</label>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-xl">
                {project.progress}% complete
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Team Members</label>
            <div className="space-y-2">
              {project.members.map((member, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{member.name}</span>
                </div>
              ))}
              {project.members.length === 0 && (
                <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-xl">
                  No team members yet
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setIsDetailsModalOpen(false)}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete Project"
        description="This action cannot be undone. This will permanently delete the project and all its data."
      >
        <div className="space-y-6 py-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">
                  Permanently Delete "{project.name}"
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  This will delete all tasks, files, and chat messages associated with this project.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="border-0 bg-muted/50 hover:bg-muted transition-all duration-200"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isUpdating}
            >
              {isUpdating ? "Deleting..." : "Delete Permanently"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export const ProjectCard = memo(ProjectCardInner)
