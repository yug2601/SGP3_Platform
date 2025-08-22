"use client"

import { useState, useEffect } from "react"
import { motion } from "@/components/motion"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  { name: "Authentication", status: "complete", description: "Clerk integration with sign-in/sign-up" },
  { name: "Dashboard", status: "complete", description: "Home page with user stats and activity" },
  { name: "Projects", status: "complete", description: "Project management with CRUD operations" },
  { name: "Tasks", status: "complete", description: "Task management with Kanban board" },
  { name: "Chat", status: "complete", description: "Team communication interface" },
  { name: "Notifications", status: "complete", description: "Notification center with filtering" },
  { name: "Profile", status: "complete", description: "User profile and preferences" },
  { name: "Settings", status: "complete", description: "App configuration and preferences" },
  { name: "Theme Toggle", status: "complete", description: "Dark/light mode switching" },
  { name: "Responsive Design", status: "complete", description: "Mobile-first responsive layout" },
  { name: "Animations", status: "complete", description: "Framer Motion page transitions" },
  { name: "Error Handling", status: "complete", description: "Error boundaries and 404 pages" }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "complete":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "in-progress":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "pending":
      return <AlertCircle className="h-4 w-4 text-gray-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "complete":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "in-progress":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    case "pending":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function AppStatus() {
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    const completed = features.filter(f => f.status === "complete").length
    setCompletedCount(completed)
  }, [])

  const completionPercentage = Math.round((completedCount / features.length) * 100)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              TogetherFlow Development Status
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {completionPercentage}% Complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4 dark:bg-gray-700">
              <motion.div
                className="bg-green-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-muted-foreground">
              {completedCount} of {features.length} core features implemented
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Feature Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(feature.status)}
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(feature.status)}>
                    {feature.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
