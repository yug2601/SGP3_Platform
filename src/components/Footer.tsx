import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-sm flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              TogetherFlow
            </span>
            <span className="text-xs text-muted-foreground">v1.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <Link 
            href="/about" 
            className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 font-medium"
          >
            About
          </Link>
          <Link 
            href="/help" 
            className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 font-medium"
          >
            Help
          </Link>
          <Link 
            href="/privacy" 
            className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105 font-medium"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
}
