"use client"

import { useEffect, useMemo, useState, memo, useCallback } from "react"
import { motion } from "@/components/motion"
import { Plus, Search, Filter, Grid, List, Sparkles, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import dynamic from "next/dynamic"
const ProjectCard = dynamic(() => import("@/components/ProjectCard").then(m => m.ProjectCard), { ssr: false })
import { ProgressiveList } from "@/components/ProgressiveList"
import { Modal } from "@/components/Modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/lib/api"
import type { Project } from "@/lib/types"
import { useToast } from "@/components/ui/toast"
import { useAuth, useClerk } from "@clerk/nextjs"

const ProjectListItem = memo(function ProjectListItem({ project, index }: { project: Project, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <ProjectCard
        project={{
          ...project,
          dueDate: project.dueDate ? new Date(project.dueDate).toLocaleDateString() : '',
        } as any}
        onClick={() => { window.location.href = `/projects/${project.id}` }}
      />
    </motion.div>
  )
})

export default function ProjectsPage() {
  const { isSignedIn, getToken } = useAuth()
  const { openSignIn, signOut } = useClerk()

  const [searchQuery, setSearchQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [newProject, setNewProject] = useState({ name: "", description: "" })
  const { show, Toast } = useToast()

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Include Bearer token (default session token) as a fallback in dev
      const token = isSignedIn ? await getToken() : null
      const data = await api<Project[]>("/api/projects", {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setProjects(data)
    } catch (e: any) {
      setError(e?.message || "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }, [isSignedIn, getToken])

  useEffect(() => {
    if (!isSignedIn) {
      setProjects([])
      setError("Unauthorized")
      return
    }
    load()
  }, [isSignedIn, load])

  useEffect(() => {
    const id = setTimeout(() => setDebounced(searchQuery), 200)
    return () => clearTimeout(id)
  }, [searchQuery])

  const filteredProjects = useMemo(() => {
    const q = debounced.toLowerCase()
    return projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(q) || project.description.toLowerCase().includes(q)
      const matchesFilter = filterStatus === "all" || project.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [projects, debounced, filterStatus])

  async function createProject() {
    if (!newProject.name.trim()) return
    try {
      if (!isSignedIn) {
        openSignIn({});
        return;
      }
      const token = await getToken()
      const created = await api<Project>("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name: newProject.name, description: newProject.description }),
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      setProjects(prev => [created, ...prev])
      setIsCreateModalOpen(false)
      setNewProject({ name: "", description: "" })
      show("Project created")
    } catch {
      show("Failed to create project")
    }
  }

  return (
    <div className="space-y-8">
      <Toast />
      
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Projects
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage and track your team projects
              </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => {
            if (!isSignedIn) {
              openSignIn({
                // Return to Projects after sign-in
                afterSignInUrl: '/projects',
                // Some Clerk versions use redirectUrl
                redirectUrl: '/projects',
              })
              return
            }
            setIsCreateModalOpen(true)
          }}
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </motion.div>

      {/* Enhanced Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-0 bg-white/50 dark:bg-white/10 focus:bg-white dark:focus:bg-white/20 transition-all duration-200 rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-12 px-4 border-0 bg-white/50 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all duration-200 rounded-xl">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuItem onClick={() => setFilterStatus("all")} className="cursor-pointer">
                      All Projects
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("active")} className="cursor-pointer">
                      Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("completed")} className="cursor-pointer">
                      Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus("on-hold")} className="cursor-pointer">
                      On Hold
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="flex border border-border/50 rounded-xl overflow-hidden bg-white/50 dark:bg-white/10">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none h-12 px-4 border-0 bg-transparent hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-200"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none h-12 px-4 border-0 bg-transparent hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-200"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Projects Grid/List */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800"
        >
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </motion.div>
      )}
      
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gradient-to-br from-muted/50 to-muted animate-pulse" />
          ))}
        </motion.div>
      ) : (
        <motion.div layout>
          <ProgressiveList
            items={filteredProjects}
            containerClassName={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}
            initial={18}
            step={18}
            renderItem={(project, index) => (
              <ProjectListItem project={project as any} index={index} />
            )}
          />
        </motion.div>
      )}

      {error === 'Unauthorized' && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300">You are not signed in. Please sign in to view and create projects.</p>
          {isSignedIn ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => load()}>Retry</Button>
              <Button variant="destructive" onClick={() => signOut({ redirectUrl: '/sign-in' })}>Sign out</Button>
            </div>
          ) : (
            <Button onClick={() => openSignIn({ afterSignInUrl: '/projects', redirectUrl: '/projects' })}>
              Sign in
            </Button>
          )}
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-muted/50 to-muted mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">No projects match your current search criteria.</p>
          <Button 
            onClick={() => {
              if (!isSignedIn) {
                openSignIn({ afterSignInUrl: '/projects', redirectUrl: '/projects' })
                return
              }
              setIsCreateModalOpen(true)
            }}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create your first project
          </Button>
        </motion.div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        description="Start a new project and invite your team members."
      >
        <div className="space-y-6 py-4">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Project Name</label>
            <Input
              placeholder="Enter project name..."
              className="h-12 border-0 bg-muted/50 focus:bg-white dark:focus:bg-white/20 transition-all duration-200 rounded-xl"
              value={newProject.name}
              onChange={(e) => setNewProject(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">Description</label>
            <Input
              placeholder="Brief description..."
              className="h-12 border-0 bg-muted/50 focus:bg-white dark:focus:bg-white/20 transition-all duration-200 rounded-xl"
              value={newProject.description}
              onChange={(e) => setNewProject(p => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              className="border-0 bg-muted/50 hover:bg-muted transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              onClick={createProject}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
