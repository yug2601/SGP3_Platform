"use client"

import { useState } from "react"
import { motion } from "@/components/motion"
import { ArrowLeft, Edit, Archive, Users, Calendar, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TaskCard } from "@/components/TaskCard"
import { ChatMessage } from "@/components/ChatMessage"
import { cn } from "@/lib/utils"

const mockProject = {
  id: "1",
  name: "Website Redesign",
  description: "Complete overhaul of the company website with modern design and improved UX. This project involves redesigning the entire user interface, improving performance, and implementing new features based on user feedback.",
  status: "active" as const,
  progress: 75,
  dueDate: "December 15, 2024",
  createdDate: "October 1, 2024",
  members: [
    { name: "John Doe", avatar: "", role: "Project Manager" },
    { name: "Jane Smith", avatar: "", role: "UI/UX Designer" },
    { name: "Mike Johnson", avatar: "", role: "Frontend Developer" },
    { name: "Sarah Wilson", avatar: "", role: "Backend Developer" },
  ],
  tasksCount: 24,
  completedTasks: 18
}

const mockTasks = [
  {
    id: "1",
    title: "Design homepage mockup",
    description: "Create wireframes and high-fidelity mockups for the new homepage design",
    status: "done" as const,
    priority: "high" as const,
    dueDate: "Nov 15",
    assignee: { name: "Jane Smith", avatar: "" }
  },
  {
    id: "2",
    title: "Implement responsive navigation",
    description: "Build mobile-responsive navigation component with hamburger menu",
    status: "in-progress" as const,
    priority: "medium" as const,
    dueDate: "Nov 20",
    assignee: { name: "Mike Johnson", avatar: "" }
  },
  {
    id: "3",
    title: "Set up authentication system",
    description: "Implement user login and registration functionality",
    status: "todo" as const,
    priority: "high" as const,
    dueDate: "Nov 25",
    assignee: { name: "Sarah Wilson", avatar: "" }
  }
]

const mockChatMessages = [
  {
    id: "1",
    content: "Hey team, I've uploaded the latest design mockups to the Files section. Please review and let me know your thoughts!",
    sender: { name: "Jane Smith", avatar: "" },
    timestamp: "10:30 AM",
    isCurrentUser: false
  },
  {
    id: "2",
    content: "Looks great! I love the new color scheme. When do you need the frontend implementation?",
    sender: { name: "Mike Johnson", avatar: "" },
    timestamp: "10:45 AM",
    isCurrentUser: false
  },
  {
    id: "3",
    content: "Thanks Mike! I'm thinking we can start implementation next week. Let me finish the responsive breakpoints first.",
    sender: { name: "Jane Smith", avatar: "" },
    timestamp: "11:00 AM",
    isCurrentUser: false
  },
  {
    id: "4",
    content: "Perfect timing! I'll have the API endpoints ready by then.",
    sender: { name: "You", avatar: "" },
    timestamp: "11:15 AM",
    isCurrentUser: true
  }
]

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "on-hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
}

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{mockProject.name}</h1>
            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-sm font-medium",
                statusColors[mockProject.status]
              )}
            >
              {mockProject.status}
            </span>
          </div>
          <p className="text-muted-foreground">
            Created on {mockProject.createdDate} • Due {mockProject.dueDate}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProject.progress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-700">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mockProject.progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProject.members.length}</div>
            <div className="flex -space-x-2 mt-2">
              {mockProject.members.slice(0, 4).map((member, index) => (
                <Avatar key={index} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockProject.completedTasks}/{mockProject.tasksCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockProject.tasksCount - mockProject.completedTasks} remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {mockProject.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockProject.members.map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Tasks</h3>
            <Button>Add Task</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TaskCard task={task} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">File management coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {mockChatMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button>Send</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}