import type { Project, ProjectMember, ProjectRole } from './types'

export class ProjectPermissions {
  private project: Project
  private userId: string

  constructor(project: Project, userId: string) {
    this.project = project
    this.userId = userId
  }

  private getCurrentUserMember(): ProjectMember | null {
    return this.project.members.find(m => m.id === this.userId) || null
  }

  private getCurrentUserRole(): ProjectRole | null {
    if (this.project.ownerId === this.userId) return 'leader'
    const member = this.getCurrentUserMember()
    return member?.role || null
  }

  // Check if user is the project owner (leader)
  isOwner(): boolean {
    return this.project.ownerId === this.userId
  }

  // Check if user is a leader
  isLeader(): boolean {
    return this.getCurrentUserRole() === 'leader'
  }

  // Check if user is a co-leader
  isCoLeader(): boolean {
    return this.getCurrentUserRole() === 'co-leader'
  }

  // Check if user is a member (any role)
  isMember(): boolean {
    return this.getCurrentUserRole() !== null
  }

  // Check if user can manage tasks (owner or leader or co-leader)
  canManageTasks(): boolean {
    if (this.project.ownerId === this.userId) return true
    const role = this.getCurrentUserRole()
    return role === 'leader' || role === 'co-leader'
  }

  // Check if user can delete project (only leader/owner)
  canDeleteProject(): boolean {
    return this.isLeader()
  }

  // Check if user can manage members (only leader)
  canManageMembers(): boolean {
    return this.isLeader()
  }

  // Check if user can edit project details (owner or leader or co-leader)
  canEditProject(): boolean {
    if (this.isOwner()) return true
    const role = this.getCurrentUserRole()
    return role === 'leader' || role === 'co-leader'
  }

  // Check if user can view project (any member or owner)
  canViewProject(): boolean {
    return this.project.ownerId === this.userId || this.isMember()
  }

  // Get current user's role
  getUserRole(): ProjectRole | null {
    return this.getCurrentUserRole()
  }

  // Get current user's member info
  getUserMember(): ProjectMember | null {
    return this.getCurrentUserMember()
  }
}

export function getProjectPermissions(project: Project, userId: string): ProjectPermissions {
  return new ProjectPermissions(project, userId)
}