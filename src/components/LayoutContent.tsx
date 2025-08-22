"use client"

import { ThemeProvider } from 'next-themes'
import { motion, AnimatePresence } from '@/components/motion'
import { usePathname } from 'next/navigation'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'
import { useUIStore } from '@/lib/zustand'

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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <motion.main
            animate={{
              marginLeft: sidebarCollapsed ? 80 : 256,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 min-h-[calc(100vh-4rem)]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="container mx-auto px-4 py-6"
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
