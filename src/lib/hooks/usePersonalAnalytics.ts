'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { PersonalAnalyticsData } from '@/lib/types'

interface UsePersonalAnalyticsOptions {
  timeframe?: string
  refreshInterval?: number
  autoRefresh?: boolean
}

export function usePersonalAnalytics(options: UsePersonalAnalyticsOptions = {}) {
  const { user } = useUser()
  const [data, setData] = useState<PersonalAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [timeframe, setTimeframe] = useState(options.timeframe || '30d')

  const fetchPersonalAnalytics = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await api<PersonalAnalyticsData>(`/api/analytics/personal?timeframe=${timeframe}`)
      
      setData(response)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch personal analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }, [user?.id, timeframe])

  const refresh = useCallback(() => {
    fetchPersonalAnalytics()
  }, [fetchPersonalAnalytics])

  // Initial data load
  useEffect(() => {
    if (user?.id) {
      fetchPersonalAnalytics()
    }
  }, [fetchPersonalAnalytics, user?.id])

  // Auto-refresh functionality
  useEffect(() => {
    if (!options.autoRefresh || !user?.id) return

    const interval = setInterval(() => {
      fetchPersonalAnalytics()
    }, options.refreshInterval || 30000)

    return () => clearInterval(interval)
  }, [fetchPersonalAnalytics, options.autoRefresh, options.refreshInterval, user?.id])

  // Update timeframe
  const updateTimeframe = useCallback((newTimeframe: string) => {
    setTimeframe(newTimeframe)
  }, [])

  // Listen for timeframe changes
  useEffect(() => {
    if (timeframe !== options.timeframe) {
      fetchPersonalAnalytics()
    }
  }, [timeframe, options.timeframe, fetchPersonalAnalytics])

  return {
    data,
    loading,
    error,
    refresh,
    setTimeframe: updateTimeframe,
    lastUpdated,
  }
}