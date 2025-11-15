"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useProfile } from "@/lib/hooks/useProfile"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const { updateProfile } = useProfile()

  const handleThemeChange = async (newTheme: string) => {
    // Immediately apply theme change
    setTheme(newTheme)
    
    // Also save to profile
    if (updateProfile) {
      try {
        await updateProfile({
          preferences: {
            theme: newTheme as 'light' | 'dark' | 'system'
          }
        })
      } catch (err) {
        console.error('Failed to update theme preference:', err)
      }
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-all duration-200 hover:shadow-md"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/50 bg-background/95 backdrop-blur-sm">
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className="cursor-pointer rounded-lg m-1 hover:bg-accent/50 transition-all duration-200"
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className="cursor-pointer rounded-lg m-1 hover:bg-accent/50 transition-all duration-200"
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className="cursor-pointer rounded-lg m-1 hover:bg-accent/50 transition-all duration-200"
        >
          <Monitor className="h-4 w-4 mr-2" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
