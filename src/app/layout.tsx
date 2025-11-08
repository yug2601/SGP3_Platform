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
  
  // Allow builds to proceed without Clerk keys (they can be added in Vercel later)
  if (!publishableKey) {
    console.warn('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - using fallback layout')
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-8">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
                <p className="font-bold">Configuration Required</p>
                <p>Please add your Clerk environment variables to complete the setup.</p>
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
