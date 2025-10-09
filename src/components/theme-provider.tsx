"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme as useNextTheme } from "next-themes"
import { useUser } from "@clerk/nextjs"

interface ThemeContextType {
  theme: string | undefined
  setTheme: (theme: string) => void
  resolvedTheme: string | undefined
  systemTheme: string | undefined
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useAppTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useAppTheme must be used within an AppThemeProvider")
  }
  return context
}

interface AppThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function AppThemeProvider({
  children,
}: AppThemeProviderProps) {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme()
  const { user, isLoaded } = useUser()
  const [isInitialized, setIsInitialized] = useState(false)

  // Load user's preferred theme from profile on mount
  useEffect(() => {
    if (!isLoaded || isInitialized) return

    const loadUserTheme = async () => {
      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          if (data.profile?.preferences?.theme) {
            setTheme(data.profile.preferences.theme)
          }
        }
      } catch (error) {
        console.error('Failed to load user theme:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    if (user) {
      loadUserTheme()
    } else {
      setIsInitialized(true)
    }
  }, [user, isLoaded, isInitialized, setTheme])

  // Update theme when user changes it
  const updateTheme = async (newTheme: string) => {
    setTheme(newTheme)
    
    // Save to user profile if authenticated
    if (user) {
      try {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            preferences: {
              theme: newTheme
            }
          })
        })
      } catch (error) {
        console.error('Failed to save theme preference:', error)
      }
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        resolvedTheme,
        systemTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}