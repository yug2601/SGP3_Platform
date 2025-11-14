"use client"

import React, { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { motion } from "@/components/motion"
import { AlertCircle, Edit2, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProfile } from "@/lib/hooks/useProfile"

export default function ProfilePage() {
  const { isLoaded } = useUser()
  const { profile, loading, error, updateProfile } = useProfile()
  
  // If profile is still loading or missing, show a default profile
  const displayProfile = React.useMemo(() => profile || {
    id: '',
    clerkId: '',
    email: '',
    name: 'User',
    firstName: '',
    lastName: '',
    imageUrl: '',
    bio: '',
    preferences: { theme: 'system' as const, timezone: 'UTC' },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: false,
      weeklyDigest: true,
      projectUpdates: true,
      taskReminders: true,
      teamInvites: true
    },
    stats: { projectsCreated: 0, tasksCompleted: 0, teamCollaborations: 0, messagesSent: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }, [profile])
  
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  })

  // Update form data when profile loads
  React.useEffect(() => {
    if (displayProfile) {
      setFormData({
        firstName: displayProfile.firstName || '',
        lastName: displayProfile.lastName || '',
        bio: displayProfile.bio || '',
      })
    }
  }, [displayProfile])

  const handleSave = async (section: string) => {
    if (!updateProfile) return
    
    try {
      if (section === 'personal') {
        await updateProfile({
          personalInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            bio: formData.bio
          }
        })
      }
      setEditingSection(null)
    } catch (err) {
      console.error('Failed to update profile:', err)
    }
  }

  const handleCancel = () => {
    if (profile) {
      // Reset form data
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
      })
    }
    setEditingSection(null)
  }

  if (!isLoaded || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error loading profile</p>
                <p className="text-sm">Please try refreshing the page. If the problem persists, contact support.</p>
              </div>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-6"
      >
        <Avatar className="h-20 w-20">
          <AvatarImage src={displayProfile.imageUrl} />
          <AvatarFallback>
            {displayProfile.firstName?.[0]}{displayProfile.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">
            {displayProfile.firstName && displayProfile.lastName 
              ? `${displayProfile.firstName} ${displayProfile.lastName}` 
              : displayProfile.name || 'User Profile'
            }
          </h1>
          <p className="text-muted-foreground">{displayProfile.email}</p>
          <p className="text-xs text-muted-foreground">
            Member since {new Date(displayProfile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </motion.div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="stats">Account Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Personal Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editingSection === 'personal' ? handleCancel() : setEditingSection('personal')}
              >
                {editingSection === 'personal' ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                {editingSection === 'personal' ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                {editingSection === 'personal' ? (
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-1"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {displayProfile.firstName || 'Not set'}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                {editingSection === 'personal' ? (
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="mt-1"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {displayProfile.lastName || 'Not set'}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                {editingSection === 'personal' ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="mt-1 w-full min-h-[80px] px-3 py-2 border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {displayProfile.bio || 'No bio added yet'}
                  </p>
                )}
              </div>
              {editingSection === 'personal' && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleSave('personal')} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <span className="text-sm font-medium">Projects Created</span>
                  <span className="text-2xl font-bold text-blue-600">{displayProfile.stats.projectsCreated}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <span className="text-sm font-medium">Tasks Completed</span>
                  <span className="text-2xl font-bold text-green-600">{displayProfile.stats.tasksCompleted}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <span className="text-sm font-medium">Team Collaborations</span>
                  <span className="text-2xl font-bold text-purple-600">{displayProfile.stats.teamCollaborations}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <span className="text-sm font-medium">Messages Sent</span>
                  <span className="text-2xl font-bold text-orange-600">{displayProfile.stats.messagesSent}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
