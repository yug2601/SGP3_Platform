"use client"

import dynamic from 'next/dynamic'
import { ThemeProvider } from 'next-themes'
import { motion, AnimatePresence } from '@/components/motion'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/lib/zustand'

const Header = dynamic(() => import('@/components/Header').then(m => m.Header), { ssr: false })
const Sidebar = dynamic(() => import('@/components/Sidebar').then(m => m.Sidebar), { ssr: false })
const Footer = dynamic(() => import('@/components/Footer').then(m => m.Footer), { ssr: false })

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
        <Header />
        <div className="flex">
          <Sidebar />
          <motion.main
            animate={{
              marginLeft: sidebarCollapsed ? 80 : 280,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 min-h-[calc(100vh-4rem)] relative"
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
        <Footer />
      </div>
    </ThemeProvider>
  )
}
