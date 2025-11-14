import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { ProjectModel, UserModel } from '@/lib/models'

interface ProjectMember {
  id: string
  name: string
  avatar?: string
  role: string
  joinedAt: Date
}

interface ProjectDoc {
  _id: any
  name: string
  members: ProjectMember[]
}

export async function POST() {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    let fixedProjects = 0
    let fixedMembers = 0
    const issues: any[] = []

    // Get all projects
    const projects = await ProjectModel.find({}).lean() as unknown as ProjectDoc[]
    
    for (const project of projects) {
      let needsUpdate = false
      const updatedMembers: ProjectMember[] = []
      
      for (const member of project.members || []) {
        // If member has "Project Owner" name or empty/missing name, try to fix it
        if (!member.name || member.name === 'Project Owner' || member.name.trim() === '') {
          try {
            // Try to find user in database by clerkId
            let userProfile: any = null
            
            if (member.id) {
              userProfile = await UserModel.findOne({ clerkId: member.id }).lean()
            }
            
            let fixedName = member.name
            let fixedAvatar = member.avatar
            
            if (userProfile) {
              // Use database profile data
              fixedName = (userProfile as any).name || `${(userProfile as any).firstName || ''} ${(userProfile as any).lastName || ''}`.trim() || 'User'
              fixedAvatar = (userProfile as any).imageUrl || member.avatar
            } else if (member.id) {
              // Try to get data from Clerk (this might not work for all users)
              try {
                // For now, just use a generic name since we can't easily fetch other users from Clerk
                fixedName = 'Team Member'
              } catch {
                fixedName = 'Team Member'
              }
            } else {
              fixedName = 'Team Member'
            }
            
            updatedMembers.push({
              ...member,
              name: fixedName,
              avatar: fixedAvatar
            })
            
            needsUpdate = true
            fixedMembers++
            
            issues.push({
              projectId: project._id.toString(),
              projectName: project.name,
              memberId: member.id,
              oldName: member.name,
              newName: fixedName,
              action: 'fixed_member_name'
            })
          } catch (error) {
            console.error(`Error fixing member ${member.id} in project ${project._id}:`, error)
            updatedMembers.push(member) // Keep original if fix fails
            issues.push({
              projectId: project._id.toString(),
              projectName: project.name,
              memberId: member.id,
              error: error instanceof Error ? error.message : 'Unknown error',
              action: 'fix_failed'
            })
          }
        } else {
          // Member already has a proper name
          updatedMembers.push(member)
        }
      }
      
      // Update project if needed
      if (needsUpdate) {
        try {
          await ProjectModel.updateOne(
            { _id: project._id },
            { $set: { members: updatedMembers } }
          )
          fixedProjects++
        } catch (updateError) {
          console.error(`Error updating project ${project._id}:`, updateError)
          issues.push({
            projectId: project._id.toString(),
            projectName: project.name,
            error: updateError instanceof Error ? updateError.message : 'Unknown error',
            action: 'project_update_failed'
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProjects: projects.length,
        fixedProjects,
        fixedMembers,
        issuesFound: issues.length
      },
      issues: issues.slice(0, 20), // Limit to first 20 issues to avoid huge responses
      message: `Fixed ${fixedMembers} member names across ${fixedProjects} projects`
    })

  } catch (error) {
    console.error('Error in fix-user-names:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()

    // Analyze current state without making changes
    const projects = await ProjectModel.find({}).lean() as unknown as ProjectDoc[]
    let issuesCount = 0
    const issuesByType: Record<string, number> = {}
    
    for (const project of projects) {
      for (const member of project.members || []) {
        if (!member.name || member.name === 'Project Owner' || member.name.trim() === '') {
          issuesCount++
          const issueType = !member.name ? 'missing_name' : member.name === 'Project Owner' ? 'project_owner_name' : 'empty_name'
          issuesByType[issueType] = (issuesByType[issueType] || 0) + 1
        }
      }
    }

    return NextResponse.json({
      analysis: {
        totalProjects: projects.length,
        totalMembers: projects.reduce((sum, p) => sum + (p.members?.length || 0), 0),
        membersWithIssues: issuesCount,
        issuesByType
      },
      recommendation: issuesCount > 0 ? 'Run POST to this endpoint to fix the issues' : 'No issues found'
    })

  } catch (error) {
    console.error('Error analyzing user names:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}