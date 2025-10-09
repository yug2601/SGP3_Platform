"use client"

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Menu, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NotificationBadge } from "@/components/NotificationBadge"
import { Button } from "@/components/ui/button"
import { useUIStore } from "@/lib/zustand"

export function Header() {
  const { toggleSidebar } = useUIStore()

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden hover:bg-accent/50 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/25 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-background animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                TogetherFlow
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">Collaborative Productivity</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SignedOut>
            <SignInButton>
              <Button 
                variant="outline" 
                className="hover:bg-accent/50 transition-all duration-200 hover:shadow-md"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <NotificationBadge />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-border/50 hover:ring-primary/50 transition-all duration-200",
                  userButtonPopoverCard: "shadow-xl border border-border/50",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
