"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "@/components/motion"
import {
  Home,
  FolderOpen,
  CheckSquare,
  MessageCircle,
  Bell,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useUIStore } from "@/lib/zustand"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: FolderOpen, label: "Projects", href: "/projects" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <motion.aside
      initial={false}
      animate={{
        width: sidebarCollapsed ? 80 : 256,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4">
          {!sidebarCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-semibold"
            >
              Navigation
            </motion.h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>
    </motion.aside>
  )
}
