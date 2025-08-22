"use client"

import * as React from "react"

export function useToast() {
  const [msg, setMsg] = React.useState<string | null>(null)
  const show = React.useCallback((text: string) => {
    setMsg(text)
    setTimeout(() => setMsg(null), 1800)
  }, [])
  const Toast = () => msg ? (
    <div className="fixed bottom-4 right-4 z-[100] rounded-md bg-foreground text-background px-3 py-2 shadow">
      <span className="text-sm">{msg}</span>
    </div>
  ) : null
  return { show, Toast }
}