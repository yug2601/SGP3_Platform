import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { UserProfile, NotificationSettings, UserPreferences } from '@/lib/types'
import { useTheme } from 'next-themes'

export function useProfile() {
  const { user, isLoaded } = useUser()
  const { setTheme } = useTheme()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user || !isLoaded) return

    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      
      const data = await response.json()
      setProfile(data.profile)
      
      // Apply theme from profile
      if (data.profile.preferences?.theme) {
        setTheme(data.profile.preferences.theme)
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [user, isLoaded, setTheme])

  // Stats are already included in the main profile fetch, so no separate stats fetch needed

  const updateProfile = useCallback(async (updates: {
    personalInfo?: {
      firstName?: string
      lastName?: string
      bio?: string
    }
    preferences?: Partial<UserPreferences>
    notificationSettings?: Partial<NotificationSettings>
  }) => {
    if (!user || !profile) return false

    try {
      setSaving(true)
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update profile')

      await response.json()
      
      // Update local profile state
      setProfile(prev => {
        if (!prev) return null
        return {
          ...prev,
          ...updates.personalInfo && {
            firstName: updates.personalInfo.firstName ?? prev.firstName,
            lastName: updates.personalInfo.lastName ?? prev.lastName,
            bio: updates.personalInfo.bio ?? prev.bio,
            name: updates.personalInfo.firstName && updates.personalInfo.lastName
              ? `${updates.personalInfo.firstName} ${updates.personalInfo.lastName}`.trim()
              : prev.name
          },
          ...updates.preferences && {
            preferences: {
              ...prev.preferences,
              ...updates.preferences
            }
          },
          ...updates.notificationSettings && {
            notificationSettings: {
              ...prev.notificationSettings,
              ...updates.notificationSettings
            }
          }
        }
      })

      // Apply theme change immediately
      if (updates.preferences?.theme) {
        setTheme(updates.preferences.theme)
      }

      setError(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
      return false
    } finally {
      setSaving(false)
    }
  }, [user, profile, setTheme])

  const refreshStats = useCallback(() => {
    // Stats are refreshed as part of the main profile fetch
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (isLoaded) {
      fetchProfile()
    }
  }, [isLoaded, fetchProfile])

  // Refresh stats periodically
  useEffect(() => {
    if (!profile) return

    const interval = setInterval(refreshStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [profile, refreshStats])

  return {
    profile,
    loading,
    saving,
    error,
    updateProfile,
    refreshStats,
    refetch: fetchProfile
  }
}