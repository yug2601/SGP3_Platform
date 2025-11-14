'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Dynamic import to prevent SSR issues with recharts
let PieChart: any, Pie: any, Cell: any, ResponsiveContainer: any, Tooltip: any, Legend: any, BarChart: any, Bar: any, XAxis: any, YAxis: any, CartesianGrid: any

interface ChartData {
  name?: string
  status?: string
  priority?: string
  role?: string
  type?: string
  category?: string
  value?: number
  count?: number
  percentage?: number
  color?: string
}

interface PieChartCardProps {
  title: string
  description?: string
  data: ChartData[]
  dataKey: string
  nameKey: string
  colors?: string[]
  showLegend?: boolean
  height?: number
  type?: 'pie' | 'bar'
  className?: string
}

const DEFAULT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
]

export function PieChartCard({ 
  title, 
  description, 
  data, 
  dataKey,
  nameKey,
  colors = DEFAULT_COLORS,
  showLegend = true,
  height = 300,
  type = 'pie',
  className 
}: PieChartCardProps) {
  const [isClient, setIsClient] = useState(false)
  const [chartsLoaded, setChartsLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Dynamically import recharts only on client side
    import('recharts').then((module) => {
      PieChart = module.PieChart
      Pie = module.Pie
      Cell = module.Cell
      ResponsiveContainer = module.ResponsiveContainer
      Tooltip = module.Tooltip
      Legend = module.Legend
      BarChart = module.BarChart
      Bar = module.Bar
      XAxis = module.XAxis
      YAxis = module.YAxis
      CartesianGrid = module.CartesianGrid
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
  // Prepare data with colors
  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || colors[index % colors.length]
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover p-3 border border-border rounded-lg shadow-lg">
          <p className="font-semibold text-popover-foreground">{data[nameKey]}</p>
          <p className="text-primary">
            {dataKey === 'percentage' ? `${data[dataKey]}%` : data[dataKey]}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-3 mt-4 justify-center">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === 'pie' ? (
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey={dataKey}
                  nameKey={nameKey}
                  label={({ percentage }: any) => `${(percentage * 1).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                {showLegend && <Legend content={<CustomLegend />} />}
              </PieChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey={nameKey}
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={dataKey} fill="#3B82F6" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}