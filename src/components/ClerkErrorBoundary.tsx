'use client'

import React from 'react'

interface ClerkErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ClerkErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ClerkErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ClerkErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Clerk Error:', error, errorInfo)
    console.error('Error stack:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      // In development, show more detailed error info
      if (process.env.NODE_ENV === 'development') {
        console.log('Clerk error details:', this.state.error)
      }
      
      return (
        <html lang="en">
          <body className="font-sans antialiased">
            <div className="min-h-screen flex items-center justify-center bg-red-50">
              <div className="max-w-md mx-auto text-center p-6">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Authentication Error
                </h1>
                <p className="text-gray-600 mb-4">
                  There was a problem loading the authentication system.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Please check your Clerk configuration and environment variables.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-gray-100 p-3 rounded text-xs text-left mb-4 overflow-auto">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
                >
                  Retry
                </button>
                <a
                  href="/"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded inline-block"
                >
                  Home
                </a>
              </div>
            </div>
          </body>
        </html>
      )
    }

    return this.props.children
  }
}

export default ClerkErrorBoundary