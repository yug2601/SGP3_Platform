"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Bell, Send } from "lucide-react"
import { api } from "@/lib/api"
import { useNotifications } from "@/lib/hooks/useNotifications"

export default function NotificationTestPage() {
  const { notifications, unreadCount, refetch } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [testData, setTestData] = useState({
    type: 'task_assigned',
    title: 'Test Notification',
    message: 'This is a test notification message'
  })

  const sendTestNotification = async () => {
    if (process.env.NODE_ENV === 'production') {
      alert('Test notifications are not available in production')
      return
    }

    try {
      setLoading(true)
      await api('/api/dev/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      })
      alert('Test notification sent!')
      refetch()
    } catch (error) {
      console.error('Failed to send test notification:', error)
      alert('Failed to send test notification')
    } finally {
      setLoading(false)
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            This page is only available in development mode.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Notification Test</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Notification Sender */}
        <Card>
          <CardHeader>
            <CardTitle>Send Test Notification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="type">Notification Type</Label>
              <Select 
                value={testData.type} 
                onValueChange={(value) => setTestData({...testData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task_assigned">Task Assigned</SelectItem>
                  <SelectItem value="task_completed">Task Completed</SelectItem>
                  <SelectItem value="project_update">Project Update</SelectItem>
                  <SelectItem value="team_invite">Team Invite</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title"
                value={testData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestData({...testData, title: e.target.value})}
                placeholder="Notification title"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message"
                value={testData.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTestData({...testData, message: e.target.value})}
                placeholder="Notification message"
                rows={3}
              />
            </div>
            
            <Button 
              onClick={sendTestNotification} 
              disabled={loading}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Sending...' : 'Send Test Notification'}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Current Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{notifications.length}</div>
              <div className="text-sm text-muted-foreground">Total Notifications</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{unreadCount}</div>
              <div className="text-sm text-muted-foreground">Unread Notifications</div>
            </div>
            
            <Button onClick={refetch} variant="outline" className="w-full">
              Refresh Notifications
            </Button>
            
            <div className="text-xs text-muted-foreground">
              Check the header for the notification badge and the notifications page for real-time updates.
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Notifications Preview */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-sm text-muted-foreground">{notification.message}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {new Date(notification.time).toLocaleTimeString()}
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full ml-auto mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}