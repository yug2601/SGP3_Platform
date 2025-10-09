'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnalyticsMetric } from "@/lib/types"
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  description?: string
  metric: AnalyticsMetric
  format?: 'number' | 'currency' | 'percentage' | 'time'
  suffix?: string
  className?: string
}

export function MetricCard({ 
  title, 
  description, 
  metric, 
  format = 'number',
  suffix,
  className 
}: MetricCardProps) {
  const formatValue = (value: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      case 'time':
        return `${value.toFixed(1)}${suffix || 'h'}`
      default:
        return value.toLocaleString() + (suffix || '')
    }
  }

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatValue(metric.current)}
            </span>
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              vs previous period
            </span>
            <Badge 
              variant="secondary" 
              className={cn("text-xs", getTrendColor())}
            >
              {metric.changePercent > 0 ? '+' : ''}{metric.changePercent.toFixed(1)}%
            </Badge>
          </div>
        </div>
        
        {/* Trend line background effect */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 opacity-20",
          metric.trend === 'up' && "bg-gradient-to-r from-green-400 to-green-600",
          metric.trend === 'down' && "bg-gradient-to-r from-red-400 to-red-600",
          metric.trend === 'stable' && "bg-gradient-to-r from-gray-400 to-gray-600"
        )} />
      </CardContent>
    </Card>
  )
}