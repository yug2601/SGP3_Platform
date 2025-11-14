"use client"

import { ThemeProvider } from 'next-themes'

export function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Simplified layout without complex components for now */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold">TogetherFlow</h1>
            <div className="text-sm text-muted-foreground">Collaborative Platform</div>
          </div>
        </header>
        
        <main className="pt-16 pb-16 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {children}
          </div>
        </main>
        
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-t">
          <div className="container mx-auto px-4 h-16 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">© 2025 TogetherFlow</p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}
