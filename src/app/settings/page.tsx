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
  
  // Load profile data when available
  useEffect(() => {
    if (profile) {
      setProfileNotifications({ ...profile.notificationSettings })
      // Sync global theme with profile theme if different
      if (profile.preferences?.theme && profile.preferences.theme !== theme) {
        setTheme(profile.preferences.theme)
      }
    }
  }, [profile, theme, setTheme])
  
  const handleNotificationChange = (key: string, value: boolean) => {
    setProfileNotifications(prev => ({ ...prev, [key]: value }))
  }
  
  const handleThemeChange = (newTheme: string) => {
    // Immediately apply theme change using global theme state
    setTheme(newTheme)
    // Also save to profile
    handleSaveTheme(newTheme)
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
  
  const handleSaveTheme = async (themeValue?: string) => {
    if (!updateProfile) return
    
    const themeToSave = themeValue || theme
    try {
      await updateProfile({
        preferences: {
          theme: themeToSave as 'light' | 'dark' | 'system'
        }
      })
    } catch (err) {
      console.error('Failed to update theme preference:', err)
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
                            onClick={() => handleThemeChange(option.value)}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                              theme === option.value
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
                          {theme === 'light' ? '☀️' : 
                           theme === 'dark' ? '🌙' : '💻'}
                        </span>
                        <span className="font-medium capitalize">
                          {theme}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {editingSection === 'preferences' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={() => { handleSaveTheme(); setEditingSection(null); }} size="sm">
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
