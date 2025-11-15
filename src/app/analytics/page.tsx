'use client'

import { useState } from 'react'
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader"
import { MetricCard } from "@/components/analytics/MetricCard"
import { ContributorsCard } from "@/components/analytics/ContributorsCard"
import { ActivitiesCard } from "@/components/analytics/ActivitiesCard"
import { useAnalytics } from '@/lib/hooks/useAnalytics'
import { usePersonalAnalytics } from '@/lib/hooks/usePersonalAnalytics'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Activity, Globe, User } from 'lucide-react'

export default function AnalyticsPage() {
  const [activeSection, setActiveSection] = useState<'platform' | 'personal'>('platform')
  const [timeframe, setTimeframe] = useState('7d')
  
  // Platform Analytics (keep original static data)
  const { data: platformData, loading: platformLoading, refresh: refreshPlatform, lastUpdated: platformLastUpdated } = useAnalytics({ timeframe })
  
  // Personal Analytics with dashboard data
  const { data: personalData, loading: personalLoading, refresh: refreshPersonal, lastUpdated: personalLastUpdated } = usePersonalAnalytics({ timeframe })
  
  const isLoading = activeSection === 'platform' ? platformLoading : personalLoading
  const lastUpdated = activeSection === 'platform' ? platformLastUpdated : personalLastUpdated

  const handleRefresh = () => {
    if (activeSection === 'platform') {
      refreshPlatform()
    } else {
      refreshPersonal()
    }
  }

  const currentData = activeSection === 'platform' ? platformData : personalData

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnalyticsHeader
        title={activeSection === 'platform' ? "Platform Analytics" : "Personal Analytics"}
        description={activeSection === 'platform' ? "Real-time insights into platform performance" : "Your personal activity and performance metrics"}
        data={currentData}
        loading={isLoading}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onRefresh={handleRefresh}
        lastUpdated={lastUpdated}
      />

      {/* Section Toggle */}
      <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeSection === 'platform' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('platform')}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Platform Analytics
        </Button>
        <Button
          variant={activeSection === 'personal' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('personal')}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Personal Analytics
        </Button>
      </div>

      {/* Platform Analytics */}
      {activeSection === 'platform' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              description="Active platform users"
              metric={{ current: 1250, previous: 1180, change: 70, changePercent: 5.9, trend: 'up' }}
            />
            <MetricCard
              title="Total Projects"
              description="Projects on platform"
              metric={{ current: 89, previous: 84, change: 5, changePercent: 6.0, trend: 'up' }}
            />
            <MetricCard
              title="Total Tasks"
              description="Tasks in system"
              metric={{ current: 456, previous: 398, change: 58, changePercent: 14.6, trend: 'up' }}
            />
            <MetricCard
              title="Revenue"
              description="Total platform revenue"
              metric={{ current: 24750, previous: 21200, change: 3550, changePercent: 16.7, trend: 'up' }}
              format="currency"
            />
          </div>

          {/* Static Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Platform activity over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2 p-4">
                  {[65, 78, 85, 92, 88, 95, 102].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs mt-2 text-muted-foreground">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>User engagement over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2 p-4">
                  {[70, 82, 79, 95, 91, 88, 96].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-green-500 rounded-t-sm transition-all duration-500 hover:bg-green-600"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs mt-2 text-muted-foreground">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
                <CardDescription>Distribution of task statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <div className="absolute inset-0 rounded-full border-[20px] border-blue-500" style={{clipPath: 'polygon(50% 50%, 100% 0, 100% 60%, 50% 50%)'}}></div>
                    <div className="absolute inset-0 rounded-full border-[20px] border-green-500" style={{clipPath: 'polygon(50% 50%, 100% 60%, 70% 100%, 50% 50%)'}}></div>
                    <div className="absolute inset-0 rounded-full border-[20px] border-yellow-500" style={{clipPath: 'polygon(50% 50%, 70% 100%, 30% 100%, 50% 50%)'}}></div>
                    <div className="absolute inset-0 rounded-full border-[20px] border-red-500" style={{clipPath: 'polygon(50% 50%, 30% 100%, 0 60%, 50% 50%)'}}></div>
                    <div className="absolute inset-0 rounded-full border-[20px] border-purple-500" style={{clipPath: 'polygon(50% 50%, 0 60%, 0 0, 50% 50%)'}}></div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 justify-center mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Completed (45%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">In Progress (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Pending (15%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Blocked (7%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Review (3%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Users by Role</CardTitle>
                <CardDescription>User distribution across roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] space-y-4 p-4">
                  {[
                    { name: 'Developers', count: 45, color: 'bg-blue-500' },
                    { name: 'Designers', count: 12, color: 'bg-purple-500' },
                    { name: 'Managers', count: 8, color: 'bg-green-500' },
                    { name: 'Analysts', count: 15, color: 'bg-yellow-500' },
                    { name: 'Admins', count: 4, color: 'bg-red-500' }
                  ].map((role, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{role.name}</span>
                        <span className="text-muted-foreground">{role.count}</span>
                      </div>
                      <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${role.color} transition-all duration-700 rounded-full`}
                          style={{ width: `${(role.count / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContributorsCard
              title="Top Contributors"
              contributors={[
                { id: '1', name: 'Alice Johnson', contributions: 45, avatar: undefined },
                { id: '2', name: 'Bob Smith', contributions: 38, avatar: undefined },
                { id: '3', name: 'Carol Davis', contributions: 32, avatar: undefined },
                { id: '4', name: 'David Wilson', contributions: 28, avatar: undefined },
                { id: '5', name: 'Eva Brown', contributions: 24, avatar: undefined }
              ]}
            />
            <ActivitiesCard
              title="Recent Activities"
              activities={[
                { id: '1', type: 'project_created', description: 'New project Alpha created', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
                { id: '2', type: 'task_completed', description: 'Design wireframes completed', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
                { id: '3', type: 'comment_added', description: 'New comment on Beta project', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
                { id: '4', type: 'member_added', description: 'John joined Gamma project', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
              ]}
            />
          </div>
        </div>
      )}

      {/* Personal Analytics */}
      {activeSection === 'personal' && (
        <div className="space-y-6">
          {/* Personal Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Your Projects"
              description="Projects you own or are member of"
              metric={{ current: 12, previous: 10, change: 2, changePercent: 20.0, trend: 'up' }}
            />
            <MetricCard
              title="Active Projects"
              description="Currently active projects"
              metric={{ current: 8, previous: 7, change: 1, changePercent: 14.3, trend: 'up' }}
            />
            <MetricCard
              title="Total Tasks"
              description="All your tasks"
              metric={{ current: 67, previous: 58, change: 9, changePercent: 15.5, trend: 'up' }}
            />
            <MetricCard
              title="Completed Tasks"
              description="Tasks you've finished"
              metric={{ current: 34, previous: 28, change: 6, changePercent: 21.4, trend: 'up' }}
            />
          </div>

          {/* Personal Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Daily Task Activity</CardTitle>
                <CardDescription>Your task completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2 p-4">
                  {[4, 7, 5, 9, 6, 8, 11].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="flex items-end h-full">
                        <div 
                          className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 hover:bg-blue-600"
                          style={{ height: `${(height / 11) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs mt-2 text-muted-foreground">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                      <span className="text-xs font-medium">{height}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Communication Activity</CardTitle>
                <CardDescription>Your messaging and collaboration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end justify-between gap-2 p-4">
                  {[12, 18, 15, 22, 19, 16, 25].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="flex items-end h-full">
                        <div 
                          className="w-full bg-green-500 rounded-t-sm transition-all duration-500 hover:bg-green-600"
                          style={{ height: `${(height / 25) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs mt-2 text-muted-foreground">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                      </span>
                      <span className="text-xs font-medium">{height}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Tasks by Status</CardTitle>
                <CardDescription>Distribution of your task statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] space-y-4 p-4">
                  {[
                    { name: 'Completed', count: 34, total: 67, color: 'bg-green-500' },
                    { name: 'In Progress', count: 18, total: 67, color: 'bg-blue-500' },
                    { name: 'Pending', count: 12, total: 67, color: 'bg-yellow-500' },
                    { name: 'Blocked', count: 3, total: 67, color: 'bg-red-500' }
                  ].map((status, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{status.name}</span>
                        <span className="text-muted-foreground">{status.count} / {status.total}</span>
                      </div>
                      <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${status.color} transition-all duration-700 rounded-full`}
                          style={{ width: `${(status.count / status.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Projects by Status</CardTitle>
                <CardDescription>Status breakdown of your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
                    <div className="text-center p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">8</div>
                      <div className="text-sm text-green-600">Active</div>
                    </div>
                    <div className="text-center p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-700">2</div>
                      <div className="text-sm text-yellow-600">On Hold</div>
                    </div>
                    <div className="text-center p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">2</div>
                      <div className="text-sm text-blue-600">Completed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Activity Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ContributorsCard
              title="Your Team Contributors"
              contributors={[
                { id: '1', name: 'You', contributions: 34, avatar: undefined },
                { id: '2', name: 'Sarah Chen', contributions: 28, avatar: undefined },
                { id: '3', name: 'Mike Johnson', contributions: 22, avatar: undefined },
                { id: '4', name: 'Lisa Wang', contributions: 19, avatar: undefined },
                { id: '5', name: 'Alex Smith', contributions: 15, avatar: undefined }
              ]}
            />
            <ActivitiesCard
              title="Your Recent Activities"
              activities={[
                { id: '1', type: 'task_completed', description: 'Completed API integration task', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
                { id: '2', type: 'comment_added', description: 'Commented on design review', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
                { id: '3', type: 'task_created', description: 'Created new frontend task', timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString() },
                { id: '4', type: 'project_updated', description: 'Updated project status', timestamp: new Date(Date.now() - 1000 * 60 * 105).toISOString() }
              ]}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !currentData && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground mb-4">
                Analytics data is not available at the moment.
              </p>
              <Button onClick={handleRefresh} variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}