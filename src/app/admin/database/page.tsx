"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function AdminDatabasePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [fixResult, setFixResult] = useState<any>(null)

  const analyzeDatabase = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/admin/cleanup-database')
      const data = await response.json()
      setAnalysisResult(data)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const fixDatabase = async () => {
    setIsFixing(true)
    try {
      const response = await fetch('/api/admin/cleanup-database', { method: 'POST' })
      const data = await response.json()
      setFixResult(data)
    } catch (error) {
      console.error('Fix failed:', error)
    } finally {
      setIsFixing(false)
    }
  }

  const fixUserNames = async () => {
    setIsFixing(true)
    try {
      const response = await fetch('/api/admin/fix-user-names', { method: 'POST' })
      const data = await response.json()
      setFixResult(data)
    } catch (error) {
      console.error('User names fix failed:', error)
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Database Administration</h1>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> These tools modify your database. Use with caution and ensure you have backups.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Database Cleanup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze and fix database integrity issues like duplicate users, null values, and orphaned records.
            </p>
            
            <div className="flex gap-2">
              <Button 
                onClick={analyzeDatabase}
                disabled={isAnalyzing}
                variant="outline"
              >
                {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Database
              </Button>
              
              <Button 
                onClick={fixDatabase}
                disabled={isFixing}
                variant="destructive"
              >
                {isFixing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fix Issues
              </Button>
            </div>
            
            {analysisResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Analysis Results:</h4>
                <ul className="text-sm space-y-1">
                  <li>Total Users: {analysisResult.analysis?.totalUsers}</li>
                  <li>Users without Clerk ID: {analysisResult.analysis?.usersWithoutClerkId}</li>
                  <li>Users without Email: {analysisResult.analysis?.usersWithoutEmail}</li>
                  <li>Email Duplicates: {analysisResult.analysis?.emailDuplicates}</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Names Fix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fix project members showing "Project Owner" instead of actual user names.
            </p>
            
            <Button 
              onClick={fixUserNames}
              disabled={isFixing}
              variant="secondary"
              className="w-full"
            >
              {isFixing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fix Project Member Names
            </Button>
          </CardContent>
        </Card>
      </div>

      {fixResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Operation Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(fixResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}