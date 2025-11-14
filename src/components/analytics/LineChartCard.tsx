'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ActivityDataPoint } from "@/lib/types"

// Dynamic import to prevent SSR issues with recharts
let LineChart: any, Line: any, XAxis: any, YAxis: any, CartesianGrid: any, Tooltip: any, ResponsiveContainer: any, Area: any, AreaChart: any

interface LineChartCardProps {
  title: string
  description?: string
  data: ActivityDataPoint[]
  dataKey?: string
  color?: string
  gradient?: boolean
  height?: number
  className?: string
}

export function LineChartCard({ 
  title, 
  description, 
  data, 
  dataKey = 'value',
  color = '#3B82F6',
  gradient = false,
  height = 300,
  className 
}: LineChartCardProps) {
  const [isClient, setIsClient] = useState(false)
  const [chartsLoaded, setChartsLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Dynamically import recharts only on client side
    import('recharts').then((module) => {
      LineChart = module.LineChart
      Line = module.Line
      XAxis = module.XAxis
      YAxis = module.YAxis
      CartesianGrid = module.CartesianGrid
      Tooltip = module.Tooltip
      ResponsiveContainer = module.ResponsiveContainer
      Area = module.Area
      AreaChart = module.AreaChart
      setChartsLoaded(true)
    })
  }, [])

  if (!isClient || !chartsLoaded) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Skeleton className="w-full h-[300px]" />
        </CardContent>
      </Card>
    )
  }

  const ChartComponent = gradient ? AreaChart : LineChart

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.2} />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  color: 'hsl(var(--popover-foreground))'
                }}
                labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
              />
              {gradient ? (
                <>
                  <defs>
                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={3}
                    fill={`url(#gradient-${color})`}
                    dot={{ fill: color, stroke: 'hsl(var(--background))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: color, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ fill: color, stroke: 'hsl(var(--background))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: color, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}