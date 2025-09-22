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
  BarChart3,
  CalendarDays,
} from "lucide-react"
import { useUIStore } from "@/lib/zustand"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: FolderOpen, label: "Projects", href: "/projects" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: CalendarDays, label: "Calendar", href: "/calendar" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
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
        width: sidebarCollapsed ? 80 : 280,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] glass border-r border-border/50"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          {!sidebarCollapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-lg font-semibold text-foreground/90"
            >
              Navigation
            </motion.h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 shadow-sm"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-r-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={cn(
                    "flex items-center justify-center w-5 h-5 transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: 0.1 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section for additional info */}
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 border-t border-border/50"
          >
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 p-3 border border-primary/20">
              <p className="text-xs font-medium text-primary mb-1">Pro Tips</p>
              <p className="text-xs text-muted-foreground">
                Use keyboard shortcuts for faster navigation
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  )
}
