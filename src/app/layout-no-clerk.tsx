import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { LayoutContent } from '@/components/LayoutContent'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Demo Mode</p>
          <p>Authentication is disabled. Add valid Clerk keys to enable auth.</p>
        </div>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  )
}