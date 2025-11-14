"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useProfile } from '@/lib/hooks/useProfile'
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz'

interface TimezoneContextType {
  timezone: string
  setTimezone: (timezone: string) => void
  formatDate: (date: Date | string, format: string) => string
  convertToUserTime: (date: Date | string) => Date
  convertToUTC: (date: Date | string) => Date
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined)

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile()
  const [timezone, setTimezoneState] = useState('UTC')

  // Load timezone from profile
  useEffect(() => {
    if (profile?.preferences?.timezone) {
      setTimezoneState(profile.preferences.timezone)
    } else {
      // Fallback to browser timezone
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setTimezoneState(browserTz)
    }
  }, [profile])

  const setTimezone = (newTimezone: string) => {
    setTimezoneState(newTimezone)
  }

  const formatDate = (date: Date | string, format: string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return formatInTimeZone(dateObj, timezone, format)
  }

  const convertToUserTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Date(formatInTimeZone(dateObj, timezone, 'yyyy-MM-dd\'T\'HH:mm:ss'))
  }

  const convertToUTC = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return zonedTimeToUtc(dateObj, timezone)
  }

  return (
    <TimezoneContext.Provider value={{
      timezone,
      setTimezone,
      formatDate,
      convertToUserTime,
      convertToUTC
    }}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  const context = useContext(TimezoneContext)
  if (!context) {
    throw new Error('useTimezone must be used within a TimezoneProvider')
  }
  return context
}