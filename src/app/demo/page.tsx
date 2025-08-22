"use client"

import { motion } from "@/components/motion"
import Link from "next/link"
import { 
  Home, 
  FolderOpen, 
  CheckSquare, 
  MessageCircle, 
  Bell, 
  User, 
  Settings,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const demoPages = [
  {
    title: "Dashboard",
    description: "Welcome page with user stats and recent activity",
    href: "/",
    icon: Home,
    color: "bg-blue-500"
  },
  {
    title: "Projects",
    description: "Project management with grid/list views and filtering",
    href: "/projects",
    icon: FolderOpen,
    color: "bg-green-500"
  },
  {
    title: "Tasks",
    description: "Kanban-style task management across all projects",
    href: "/tasks",
    icon: CheckSquare,
    color: "bg-purple-500"
  },
  {
    title: "Chat",
    description: "Team communication with channels and direct messages",
    href: "/chat",
    icon: MessageCircle,
    color: "bg-orange-500"
  },
  {
    title: "Notifications",
    description: "Notification center with filtering and actions",
    href: "/notifications",
    icon: Bell,
    color: "bg-red-500"
  },
  {
    title: "Profile",
    description: "User profile with preferences and statistics",
    href: "/profile",
    icon: User,
    color: "bg-indigo-500"
  },
  {
    title: "Settings",
    description: "App configuration and user preferences",
    href: "/settings",
    icon: Settings,
    color: "bg-gray-500"
  }
]

const features = [
  "🎨 Modern UI with shadcn/ui components",
  "🌙 Dark/Light mode with next-themes",
  "📱 Fully responsive mobile-first design",
  "🔐 Authentication with Clerk",
  "✨ Smooth animations with Framer Motion",
  "🎯 TypeScript for type safety",
  "⚡ Next.js 15 with App Router",
  "🎪 Zustand for state management"
]

export default function DemoPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold">TogetherFlow Demo</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore all the features of our collaborative productivity platform. 
          Click on any page below to see it in action!
        </p>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          🚀 Fully Functional Demo
        </Badge>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>✨ Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pages Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {demoPages.map((page, index) => (
          <motion.div
            key={page.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
              <Link href={page.href}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${page.color} flex items-center justify-center`}>
                      <page.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {page.title}
                      </CardTitle>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {page.description}
                  </p>
                </CardContent>
              </Link>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Additional Pages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>📄 Additional Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Link href="/about">
                  <span className="font-medium">About</span>
                  <span className="text-xs text-muted-foreground">Learn about TogetherFlow</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Link href="/help">
                  <span className="font-medium">Help</span>
                  <span className="text-xs text-muted-foreground">FAQ and support</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Link href="/privacy">
                  <span className="font-medium">Privacy</span>
                  <span className="text-xs text-muted-foreground">Privacy policy</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col space-y-2">
                <Link href="/status">
                  <span className="font-medium">Status</span>
                  <span className="text-xs text-muted-foreground">Development progress</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>🛠️ Tech Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 15",
                "TypeScript",
                "Tailwind CSS",
                "shadcn/ui",
                "Framer Motion",
                "Clerk Auth",
                "Zustand",
                "next-themes",
                "Lucide Icons"
              ].map((tech, index) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center"
      >
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Experience the full power of collaborative productivity with TogetherFlow.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/projects">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  View Projects
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
