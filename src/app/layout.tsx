import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { LayoutContent } from '@/components/LayoutContent'
import ClerkErrorBoundary from '@/components/ClerkErrorBoundary'
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
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  
  // Check for required Clerk keys
  if (!publishableKey) {
    console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
    
    // In production, provide a basic layout that works
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                <p className="font-bold">⚠️ Authentication Configuration Error</p>
                <p>The application is not properly configured for authentication.</p>
                <p className="text-sm mt-2">Administrator: Please check environment variables.</p>
              </div>
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  TogetherFlow
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  The application is currently being configured. Please try again later.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up" 
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ClerkErrorBoundary>
            <LayoutContent>{children}</LayoutContent>
          </ClerkErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  )
}
