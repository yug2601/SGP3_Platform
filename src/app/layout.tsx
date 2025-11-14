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
    console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - authentication will not work')
    
    // In production, throw an error instead of showing fallback
    if (process.env.NODE_ENV === 'production') {
      throw new Error('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required for production deployment')
    }
    
    // Development fallback
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
                <p className="font-bold">⚠️ Configuration Required</p>
                <p>Please add your Clerk environment variables to complete the setup.</p>
                <p className="text-sm mt-2">Required: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</p>
              </div>
              {children}
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <ClerkErrorBoundary>
      <ClerkProvider
        publishableKey={publishableKey}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        afterSignUpUrl="/"
        appearance={{
          baseTheme: undefined,
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          },
        }}
      >
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.variable} font-sans antialiased`}>
            <LayoutContent>{children}</LayoutContent>
          </body>
        </html>
      </ClerkProvider>
    </ClerkErrorBoundary>
  )
}
