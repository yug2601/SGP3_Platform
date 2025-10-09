'use client'

import { useState, useEffect, useCallback } from 'react'
import { DashboardAnalytics } from '@/lib/types'

interface UseAnalyticsOptions {
  timeframe?: string
  refreshInterval?: number
  autoRefresh?: boolean
}

interface UseAnalyticsReturn {
  data: DashboardAnalytics | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  setTimeframe: (timeframe: string) => void
  lastUpdated: Date | null
}

export function useAnalytics({
  timeframe = '30d',
  refreshInterval = 30000, // 30 seconds
  autoRefresh = true
}: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const [data, setData] = useState<DashboardAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTimeframe, setCurrentTimeframe] = useState(timeframe)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch(`/api/analytics?timeframe=${currentTimeframe}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`)
      }
      
      const analyticsData: DashboardAnalytics = await response.json()
      setData(analyticsData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setLoading(false)
    }
  }, [currentTimeframe])

  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchAnalytics()
  }, [fetchAnalytics])

  const setTimeframe = useCallback((newTimeframe: string) => {
    setCurrentTimeframe(newTimeframe)
    setLoading(true)
  }, [])

  // Initial load and timeframe changes
  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchAnalytics, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchAnalytics, refreshInterval, autoRefresh])

  return {
    data,
    loading,
    error,
    refresh,
    setTimeframe,
    lastUpdated
  }
}