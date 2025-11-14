'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatabaseCleanupPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [cleanupResult, setCleanupResult] = useState<any>(null)

  const analyzeDatabase = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/admin/cleanup-null-users', {
        method: 'GET',
      })
      const result = await response.json()
      setAnalysisResult(result)
    } catch (error) {
      console.error('Analysis failed:', error)
      setAnalysisResult({ success: false, error: 'Failed to analyze database' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const cleanupDatabase = async () => {
    setIsCleaning(true)
    try {
      const response = await fetch('/api/admin/cleanup-null-users', {
        method: 'DELETE',
      })
      const result = await response.json()
      setCleanupResult(result)
      // Refresh analysis after cleanup
      if (result.success) {
        await analyzeDatabase()
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
      setCleanupResult({ success: false, error: 'Failed to cleanup database' })
    } finally {
      setIsCleaning(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Database Cleanup - Null UserId Entries</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Analysis</CardTitle>
            <CardDescription>
              Check for duplicate entries with null/empty userId that are causing conflicts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={analyzeDatabase} 
              disabled={isAnalyzing}
              className="mb-4"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Database'}
            </Button>
            
            {analysisResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Analysis Results:</h3>
                {analysisResult.success ? (
                  <div>
                    <p><strong>Total Users:</strong> {analysisResult.totalUsers}</p>
                    <p><strong>Null UserId Entries:</strong> {analysisResult.totalNullEntries}</p>
                    {analysisResult.totalNullEntries > 0 && (
                      <div className="mt-2 text-red-600">
                        <p>⚠️ Found {analysisResult.totalNullEntries} problematic entries that need cleanup</p>
                      </div>
                    )}
                    {analysisResult.totalNullEntries === 0 && (
                      <div className="mt-2 text-green-600">
                        <p>✅ No problematic entries found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p>Error: {analysisResult.error}</p>
                    {analysisResult.details && <p>Details: {analysisResult.details}</p>}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Cleanup</CardTitle>
            <CardDescription>
              Remove duplicate entries with null userId to resolve E11000 duplicate key errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={cleanupDatabase} 
              disabled={isCleaning || !analysisResult?.success || analysisResult?.totalNullEntries === 0}
              variant="destructive"
              className="mb-4"
            >
              {isCleaning ? 'Cleaning...' : 'Cleanup Null Entries'}
            </Button>
            
            {!analysisResult && (
              <p className="text-sm text-gray-600">Run analysis first to see if cleanup is needed</p>
            )}
            
            {analysisResult?.success && analysisResult?.totalNullEntries === 0 && (
              <p className="text-sm text-green-600">No cleanup needed - database is clean</p>
            )}
            
            {cleanupResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Cleanup Results:</h3>
                {cleanupResult.success ? (
                  <div className="text-green-600">
                    <p>✅ Successfully deleted {cleanupResult.deletedCount} problematic entries</p>
                    <p>{cleanupResult.message}</p>
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p>Error: {cleanupResult.error}</p>
                    {cleanupResult.details && <p>Details: {cleanupResult.details}</p>}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What this fixes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Resolves E11000 duplicate key errors when updating profiles</li>
              <li>Removes orphaned database entries with null userId values</li>
              <li>Prevents "Try again and refresh" errors on profile updates</li>
              <li>Ensures database integrity for user profiles</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}