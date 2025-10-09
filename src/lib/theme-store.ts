import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  theme: 'light' | 'dark' | 'system'
  timezone: string
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setTimezone: (timezone: string) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      timezone: 'UTC',
      setTheme: (theme) => set({ theme }),
      setTimezone: (timezone) => set({ timezone })
    }),
    {
      name: 'togetherflow-theme-storage'
    }
  )
)