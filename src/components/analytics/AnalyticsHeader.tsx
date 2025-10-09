'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, RefreshCw, Calendar, TrendingUp } from 'lucide-react'
import { DashboardAnalytics } from '@/lib/types'
import { format } from 'date-fns'

interface AnalyticsHeaderProps {
  data: DashboardAnalytics | null
  loading: boolean
  timeframe: string
  onTimeframeChange: (timeframe: string) => void
  onRefresh: () => void
  lastUpdated: Date | null
}

const timeframeOptions = [
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' }
]

export function AnalyticsHeader({
  data,
  loading,
  timeframe,
  onTimeframeChange,
  onRefresh,
  lastUpdated
}: AnalyticsHeaderProps) {
  const [exportLoading, setExportLoading] = useState(false)

  const handleExport = async () => {
    if (!data) return
    
    setExportLoading(true)
    try {
      // Create a simple CSV export
      const csvContent = `Analytics Report - ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n` +
        `Total Users,${data.overview.totalUsers}\n` +
        `Total Projects,${data.overview.totalProjects}\n` +
        `Total Tasks,${data.overview.totalTasks}\n` +
        `Revenue,$${data.overview.revenue.toLocaleString()}\n`
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights into your platform's performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!data || exportLoading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center space-x-4">
        <Badge 
          variant={loading ? "secondary" : "default"} 
          className="flex items-center space-x-1"
        >
          <div className={`h-2 w-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`} />
          <span>{loading ? 'Updating...' : 'Live'}</span>
        </Badge>
        
        {lastUpdated && (
          <span className="text-sm text-muted-foreground flex items-center">
            <TrendingUp className="h-3 w-3 mr-1" />
            Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </span>
        )}
      </div>

      {/* Overview Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active platform users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalProjects.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Projects created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.overview.totalTasks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks managed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data.overview.revenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total revenue
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}