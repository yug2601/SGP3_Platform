"use client"

import { useState } from "react"
import { motion } from "@/components/motion"
import { Plus, Search, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectCard } from "@/components/ProjectCard"
import { Modal } from "@/components/Modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockProjects = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website with modern design and improved UX",
    status: "active" as const,
    progress: 75,
    dueDate: "Dec 15, 2024",
    members: [
      { name: "John Doe", avatar: "" },
      { name: "Jane Smith", avatar: "" },
      { name: "Mike Johnson", avatar: "" },
    ],
    tasksCount: 24
  },
  {
    id: "2",
    name: "Mobile App Development",
    description: "Native mobile application for iOS and Android platforms",
    status: "active" as const,
    progress: 45,
    dueDate: "Jan 30, 2025",
    members: [
      { name: "Sarah Wilson", avatar: "" },
      { name: "Tom Brown", avatar: "" },
    ],
    tasksCount: 18
  },
  {
    id: "3",
    name: "API Integration",
    description: "Integration with third-party APIs for enhanced functionality",
    status: "on-hold" as const,
    progress: 30,
    dueDate: "Feb 28, 2025",
    members: [
      { name: "Alex Chen", avatar: "" },
      { name: "Lisa Wang", avatar: "" },
      { name: "David Kim", avatar: "" },
      { name: "Emma Davis", avatar: "" },
    ],
    tasksCount: 12
  },
  {
    id: "4",
    name: "Database Migration",
    description: "Migration from legacy database to modern cloud solution",
    status: "completed" as const,
    progress: 100,
    dueDate: "Nov 30, 2024",
    members: [
      { name: "Robert Taylor", avatar: "" },
      { name: "Maria Garcia", avatar: "" },
    ],
    tasksCount: 8
  }
]

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  const filteredProjects = mockProjects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track your team projects
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
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
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                    All Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("completed")}>
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("on-hold")}>
                    On Hold
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid/List */}
      <motion.div
        layout
        className={
          viewMode === "grid"
            ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-4"
        }
      >
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <ProjectCard
              project={project}
              onClick={() => {
                // Navigate to project details
                window.location.href = `/projects/${project.id}`
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects found matching your criteria.</p>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        description="Start a new project and invite your team members."
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium">Project Name</label>
            <Input placeholder="Enter project name..." className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Brief description..." className="mt-1" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
