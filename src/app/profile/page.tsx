"use client"

import React, { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { motion } from "@/components/motion"
import { AlertCircle, Edit2, Save, X, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useProfile } from "@/lib/hooks/useProfile"

// Available timezones
const TIMEZONES = [
  { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
  { value: 'America/New_York', label: 'EST - Eastern Standard Time' },
  { value: 'America/Chicago', label: 'CST - Central Standard Time' },
  { value: 'America/Denver', label: 'MST - Mountain Standard Time' },
  { value: 'America/Los_Angeles', label: 'PST - Pacific Standard Time' },
  { value: 'Europe/London', label: 'GMT - Greenwich Mean Time' },
  { value: 'Asia/Kolkata', label: 'IST - India Standard Time' },
  { value: 'Asia/Dubai', label: 'GST - Gulf Standard Time' },
]

// Available themes
const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

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
    theme: 'system',
    timezone: 'UTC',
    notificationSettings: {
      emailNotifications: false,
      pushNotifications: false,
      weeklyDigest: false,
      projectUpdates: false,
      taskReminders: false,
      teamInvites: false,
    }
  })

  // Update form data when profile loads
  React.useEffect(() => {
    if (displayProfile) {
      setFormData({
        firstName: displayProfile.firstName || '',
        lastName: displayProfile.lastName || '',
        bio: displayProfile.bio || '',
        theme: displayProfile.preferences.theme || 'system',
        timezone: displayProfile.preferences.timezone || 'UTC',
        notificationSettings: { ...displayProfile.notificationSettings }
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
      } else if (section === 'preferences') {
        await updateProfile({
          preferences: {
            theme: formData.theme as 'light' | 'dark' | 'system',
            timezone: formData.timezone
          }
        })
      } else if (section === 'notifications') {
        await updateProfile({
          notificationSettings: formData.notificationSettings
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
        theme: profile.preferences.theme || 'system',
        timezone: profile.preferences.timezone || 'UTC',
        notificationSettings: { ...profile.notificationSettings }
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

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
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

            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Projects Created</span>
                  <span className="font-semibold text-blue-600">{displayProfile.stats.projectsCreated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tasks Completed</span>
                  <span className="font-semibold text-green-600">{displayProfile.stats.tasksCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Team Collaborations</span>
                  <span className="font-semibold text-purple-600">{displayProfile.stats.teamCollaborations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Messages Sent</span>
                  <span className="font-semibold text-orange-600">{displayProfile.stats.messagesSent}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>App Preferences</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editingSection === 'preferences' ? handleCancel() : setEditingSection('preferences')}
              >
                {editingSection === 'preferences' ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                {editingSection === 'preferences' ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Theme</label>
                {editingSection === 'preferences' ? (
                  <select
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {THEMES.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1 capitalize">
                    {displayProfile.preferences.theme}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Timezone</label>
                {editingSection === 'preferences' ? (
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {TIMEZONES.find(tz => tz.value === displayProfile.preferences.timezone)?.label || displayProfile.preferences.timezone}
                  </p>
                )}
              </div>
              {editingSection === 'preferences' && (
                <div className="flex gap-2 pt-2">
                  <Button onClick={() => handleSave('preferences')} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notification Settings</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => editingSection === 'notifications' ? handleCancel() : setEditingSection('notifications')}
              >
                {editingSection === 'notifications' ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                {editingSection === 'notifications' ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {Object.entries(displayProfile.notificationSettings).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    emailNotifications: 'Email Notifications',
                    pushNotifications: 'Push Notifications', 
                    weeklyDigest: 'Weekly Digest',
                    projectUpdates: 'Project Updates',
                    taskReminders: 'Task Reminders',
                    teamInvites: 'Team Invites'
                  }
                  
                  return (
                    <div key={key} className="flex items-center justify-between py-2">
                      <div>
                        <span className="text-sm font-medium">{labels[key]}</span>
                        {!editingSection && (
                          <p className="text-xs text-muted-foreground">
                            {value ? 'Enabled' : 'Disabled'}
                          </p>
                        )}
                      </div>
                      {editingSection === 'notifications' ? (
                        <Switch
                          checked={formData.notificationSettings[key as keyof typeof formData.notificationSettings]}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({
                              ...prev,
                              notificationSettings: {
                                ...prev.notificationSettings,
                                [key]: checked
                              }
                            }))
                          }
                        />
                      ) : (
                        <div className="flex items-center">
                          {value ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {editingSection === 'notifications' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={() => handleSave('notifications')} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
