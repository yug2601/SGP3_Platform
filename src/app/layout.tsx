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
  
  if (!publishableKey) {
    console.error('Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable')
    throw new Error('Missing Clerk publishable key')
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
