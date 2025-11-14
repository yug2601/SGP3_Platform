"use client"

import { useState, useEffect } from "react"
import { motion } from "@/components/motion"
import { 
  Settings, 
  Bell, 
  Palette, 
  Save,
  Edit2,
  X,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { profile, updateProfile } = useProfile()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  
  const [profileNotifications, setProfileNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    projectUpdates: true,
    taskReminders: true,
    teamInvites: true
  })
  
  const [profilePreferences, setProfilePreferences] = useState({
    theme: "system",
    timezone: "UTC"
  })
  
  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setProfileNotifications({ ...profile.notificationSettings })
      setProfilePreferences({ ...profile.preferences })
    }
  }, [profile])
  
  const handleNotificationChange = (key: string, value: boolean) => {
    setProfileNotifications(prev => ({ ...prev, [key]: value }))
  }
  
  const handlePreferenceChange = (key: string, value: string) => {
    setProfilePreferences(prev => ({ ...prev, [key]: value }))
  }
  
  const handleSaveNotifications = async () => {
    if (!updateProfile) return
    
    try {
      await updateProfile({
        notificationSettings: profileNotifications
      })
      setEditingSection(null)
    } catch (err) {
      console.error('Failed to update notifications:', err)
    }
  }
  
  const handleSavePreferences = async () => {
    if (!updateProfile) return
    
    try {
      await updateProfile({
        preferences: {
          theme: profilePreferences.theme as 'light' | 'dark' | 'system',
          timezone: profilePreferences.timezone
        }
      })
      setTheme(profilePreferences.theme) // Also update the theme immediately
      setEditingSection(null)
    } catch (err) {
      console.error('Failed to update preferences:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Settings Tabs */}
      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>



        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editingSection === 'notifications' ? setEditingSection(null) : setEditingSection('notifications')}
                >
                  {editingSection === 'notifications' ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  {editingSection === 'notifications' ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(profileNotifications).map(([key, value]) => {
                    const labels: Record<string, { title: string; description: string }> = {
                      emailNotifications: { title: 'Email Notifications', description: 'Receive notifications via email' },
                      pushNotifications: { title: 'Push Notifications', description: 'Receive push notifications in browser' },
                      weeklyDigest: { title: 'Weekly Digest', description: 'Get a weekly summary of your activity' },
                      projectUpdates: { title: 'Project Updates', description: 'Notifications about project changes' },
                      taskReminders: { title: 'Task Reminders', description: 'Reminders for upcoming deadlines' },
                      teamInvites: { title: 'Team Invites', description: 'Notifications for team invitations' }
                    }
                    
                    const config = labels[key]
                    if (!config) return null
                    
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{config.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>
                        </div>
                        {editingSection === 'notifications' ? (
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => handleNotificationChange(key, checked)}
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
                    <Button onClick={handleSaveNotifications} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Display Preferences
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editingSection === 'preferences' ? setEditingSection(null) : setEditingSection('preferences')}
                >
                  {editingSection === 'preferences' ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  {editingSection === 'preferences' ? 'Cancel' : 'Edit'}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Theme</label>
                      <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
                    </div>
                    {editingSection === 'preferences' ? (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', label: 'Light', icon: '☀️' },
                          { value: 'dark', label: 'Dark', icon: '🌙' },
                          { value: 'system', label: 'System', icon: '💻' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handlePreferenceChange('theme', option.value)}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                              profilePreferences.theme === option.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <span className="text-lg">{option.icon}</span>
                            <span className="font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-lg">
                          {profilePreferences.theme === 'light' ? '☀️' : 
                           profilePreferences.theme === 'dark' ? '🌙' : '💻'}
                        </span>
                        <span className="font-medium capitalize">
                          {profilePreferences.theme}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Timezone</label>
                      <p className="text-xs text-muted-foreground">Select your local timezone</p>
                    </div>
                    {editingSection === 'preferences' ? (
                      <select 
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600"
                        value={profilePreferences.timezone}
                        onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                      >
                        {TIMEZONES.map(tz => (
                          <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">
                          {TIMEZONES.find(tz => tz.value === profilePreferences.timezone)?.label || profilePreferences.timezone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {editingSection === 'preferences' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleSavePreferences} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-end"
      >
        <Button size="lg">
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </motion.div>
    </div>
  )
}
