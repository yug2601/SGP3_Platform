// Temporary in-memory store for dev without DB
// NOTE: This resets when the server restarts. Replace with MongoDB in production.

import { Project, Task, Notification, ActivityItem, ChatMessageItem, ID } from './types'

// Simple ID generator for dev
function id(): ID {
  return Math.random().toString(36).slice(2, 10)
}

// In-memory buckets
const projects = new Map<ID, Project>()
const tasks = new Map<ID, Task>()
const notifications = new Map<ID, Notification>()
const activity: ActivityItem[] = []
const chat = new Map<ID, ChatMessageItem[]>() // keyed by projectId

// Seed minimal data for UX
function seed(ownerId: string) {
  if (projects.size > 0) return
  const now = new Date().toISOString()

  const p1: Project = {
    id: id(),
    name: 'Website Redesign',
    description: 'Complete overhaul of the company website with modern design and improved UX',
    status: 'active',
    progress: 60,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    createdAt: now,
    updatedAt: now,
    members: [{ id: ownerId, name: 'You' }],
    tasksCount: 0,
    ownerId,
  }
  projects.set(p1.id, p1)

  const t1: Task = {
    id: id(),
    projectId: p1.id,
    title: 'Design homepage mockup',
    description: 'Create wireframes and high-fidelity mockups',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    assignee: { id: ownerId, name: 'You' },
    createdAt: now,
    updatedAt: now,
    creatorId: ownerId,
  }
  tasks.set(t1.id, t1)
  projects.set(p1.id, { ...p1, tasksCount: 1 })

  activity.unshift({
    id: id(),
    type: 'project_created',
    message: `Project "${p1.name}" created`,
    time: now,
    user: { id: ownerId, name: 'You' },
  })
}

export const store = {
  ensureSeed(ownerId: string) {
    seed(ownerId)
  },

  // Projects
  listProjects(ownerId: string) {
    return Array.from(projects.values()).filter(p => p.ownerId === ownerId)
  },
  getProject(id: ID) {
    return projects.get(id) || null
  },
  createProject(ownerId: string, data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'tasksCount' | 'ownerId'>) {
    const now = new Date().toISOString()
    const p: Project = { id: id(), createdAt: now, updatedAt: now, tasksCount: 0, ownerId, ...data }
    projects.set(p.id, p)
    activity.unshift({ id: id(), type: 'project_created', message: `Project "${p.name}" created`, time: now, user: { id: ownerId, name: 'You' } })
    return p
  },
  updateProject(idVal: ID, patch: Partial<Project>) {
    const existing = projects.get(idVal)
    if (!existing) return null
    const updated: Project = { ...existing, ...patch, updatedAt: new Date().toISOString() }
    projects.set(idVal, updated)
    activity.unshift({ id: id(), type: 'project_updated', message: `Project "${updated.name}" updated`, time: updated.updatedAt, user: { id: updated.ownerId, name: 'You' } })
    return updated
  },
  deleteProject(idVal: ID) {
    const p = projects.get(idVal)
    if (!p) return false
    // delete related tasks
    for (const t of Array.from(tasks.values())) {
      if (t.projectId === idVal) tasks.delete(t.id)
    }
    projects.delete(idVal)
    return true
  },

  // Tasks
  listTasks(ownerId: string, filters?: { projectId?: ID }) {
    let list = Array.from(tasks.values())
    // show tasks for projects owned by user
    const ownedProjectIds = new Set(this.listProjects(ownerId).map(p => p.id))
    list = list.filter(t => ownedProjectIds.has(t.projectId))
    if (filters?.projectId) list = list.filter(t => t.projectId === filters.projectId)
    return list
  },
  createTask(ownerId: string, data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'creatorId'>) {
    const now = new Date().toISOString()
    const t: Task = { id: id(), createdAt: now, updatedAt: now, creatorId: ownerId, ...data }
    tasks.set(t.id, t)
    const p = projects.get(t.projectId)
    if (p) projects.set(p.id, { ...p, tasksCount: p.tasksCount + 1, updatedAt: now })
    activity.unshift({ id: id(), type: 'task_created', message: `Task "${t.title}" created`, time: now, user: { id: ownerId, name: 'You' } })
    if (t.assignee && t.assignee.id !== ownerId) {
      const n: Notification = {
        id: id(), userId: t.assignee.id, type: 'task_assigned', title: 'You were assigned to a task',
        message: `${t.assignee.name} assigned to "${t.title}"`, isRead: false, time: now, sender: { id: ownerId, name: 'You' }
      }
      notifications.set(n.id, n)
    }
    return t
  },
  updateTask(idVal: ID, patch: Partial<Task>) {
    const existing = tasks.get(idVal)
    if (!existing) return null
    const updated: Task = { ...existing, ...patch, updatedAt: new Date().toISOString() }
    tasks.set(idVal, updated)
    if (updated.status === 'done') {
      activity.unshift({ id: id(), type: 'task_completed', message: `Task "${updated.title}" marked done`, time: updated.updatedAt, user: updated.assignee || { id: updated.creatorId, name: 'You' } })
    } else {
      activity.unshift({ id: id(), type: 'task_updated', message: `Task "${updated.title}" updated`, time: updated.updatedAt, user: updated.assignee || { id: updated.creatorId, name: 'You' } })
    }
    return updated
  },
  deleteTask(idVal: ID) {
    const t = tasks.get(idVal)
    if (!t) return false
    tasks.delete(idVal)
    const p = projects.get(t.projectId)
    if (p) projects.set(p.id, { ...p, tasksCount: Math.max(0, p.tasksCount - 1), updatedAt: new Date().toISOString() })
    return true
  },

  // Notifications
  listNotifications(userId: string) {
    return Array.from(notifications.values()).filter(n => n.userId === userId).sort((a, b) => b.time.localeCompare(a.time))
  },
  markNotificationRead(idVal: ID) {
    const n = notifications.get(idVal)
    if (!n) return null
    const updated = { ...n, isRead: true }
    notifications.set(idVal, updated)
    return updated
  },
  archiveNotification(idVal: ID) {
    return notifications.delete(idVal)
  },

  // Activity
  listActivity(limit = 50) {
    return activity.slice(0, limit)
  },

  // Chat
  listChat(projectId: ID) {
    return chat.get(projectId) || []
  },
  addChatMessage(projectId: ID, message: Omit<ChatMessageItem, 'id' | 'timestamp'>) {
    const now = new Date().toISOString()
    const msg: ChatMessageItem = { id: id(), timestamp: now, ...message, projectId }
    const list = chat.get(projectId) || []
    list.push(msg)
    chat.set(projectId, list)
    return msg
  },
}