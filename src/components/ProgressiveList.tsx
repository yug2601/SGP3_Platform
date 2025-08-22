"use client"

import { useEffect, useRef, useState, ReactNode } from "react"

interface ProgressiveListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  containerClassName?: string
  initial?: number
  step?: number
}

// Incrementally renders items as the user scrolls near the end of the list.
// Works with variable-height items and avoids heavy initial renders for long lists.
export function ProgressiveList<T>({
  items,
  renderItem,
  containerClassName,
  initial = 30,
  step = 30,
}: ProgressiveListProps<T>) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [visibleCount, setVisibleCount] = useState(() => Math.min(initial, items.length))

  useEffect(() => {
    setVisibleCount(Math.min(initial, items.length))
  }, [items, initial])

  useEffect(() => {
    const root = containerRef.current
    const sentinel = sentinelRef.current
    if (!root || !sentinel) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisibleCount((c) => Math.min(items.length, c + step))
          }
        }
      },
      { root, rootMargin: "200px" }
    )

    io.observe(sentinel)
    return () => io.disconnect()
  }, [items.length, step])

  return (
    <div ref={containerRef} className={containerClassName}>
      {items.slice(0, visibleCount).map((item, index) => (
        <div key={(item as any)?.id ?? index}>{renderItem(item, index)}</div>
      ))}
      <div ref={sentinelRef} />
    </div>
  )
}