"use client"

import dynamic from 'next/dynamic'
import { ThemeProvider } from 'next-themes'
import { motion, AnimatePresence } from '@/components/motion'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/lib/zustand'
import { SignedIn } from '@clerk/nextjs'
import { NotificationToast } from '@/components/NotificationToast'

const Header = dynamic(() => import('@/components/Header').then(m => m.Header))
const Sidebar = dynamic(() => import('@/components/Sidebar').then(m => m.Sidebar))
const Footer = dynamic(() => import('@/components/Footer').then(m => m.Footer))

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { sidebarCollapsed } = useUIStore()

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Fixed Header */}
        <Header />
        
        {/* Main Layout with Sidebar */}
        <div className="flex pt-16 pb-16">
          <Sidebar />
          <motion.main
            animate={{
              marginLeft: sidebarCollapsed ? 80 : 280,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 min-h-[calc(100vh-8rem)] relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="container mx-auto px-6 py-8 max-w-7xl"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.main>
        </div>
        
        {/* Fixed Footer */}
        <Footer />
        
        {/* Real-time notification toasts - only for signed-in users */}
        <SignedIn>
          <NotificationToast />
        </SignedIn>
      </div>
    </ThemeProvider>
  )
}
