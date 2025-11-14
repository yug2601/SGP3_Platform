import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TogetherFlow - Collaborative Productivity',
  description: 'A modern collaborative productivity web application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8">
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded">
              <p className="font-bold">🔧 Debug Mode</p>
              <p>Testing layout without Clerk authentication.</p>
              <p className="text-sm mt-2">If this loads, the issue is with Clerk configuration.</p>
            </div>
            <div className="text-center py-12">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                TogetherFlow
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Collaborative Productivity Platform
              </p>
              <div className="space-y-4">
                <p>Environment variables check:</p>
                <div className="bg-gray-100 p-4 rounded text-left text-sm">
                  <p>Clerk Key exists: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Yes' : 'No'}</p>
                  <p>MongoDB URI exists: {process.env.MONGODB_URI ? 'Yes' : 'No'}</p>
                  <p>Environment: {process.env.NODE_ENV}</p>
                  <p>Vercel URL: {process.env.VERCEL_URL || 'Not set'}</p>
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}