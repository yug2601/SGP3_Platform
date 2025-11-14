"use client"

import { motion as framerMotion, AnimatePresence as framerAnimatePresence } from "framer-motion"
import { useState, useEffect } from 'react'

// SSR-safe motion components
function createMotionComponent(component: any) {
  return function MotionComponent(props: any) {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
      setIsClient(true)
    }, [])

    if (!isClient) {
      // During SSR or hydration, render without animation
      const { initial, animate, exit, transition, whileHover, whileTap, ...otherProps } = props
      return component({ ...otherProps })
    }

    // On client, render with full animation support
    return component(props)
  }
}

// Create motion object with all HTML elements
const motionElements: any = {}
const htmlElements = [
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'section', 'article', 'aside', 'header', 'footer', 'main',
  'button', 'input', 'textarea', 'select', 'form', 'label',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'img', 'svg', 'path', 'circle', 'rect', 'line', 'a', 'nav'
]

htmlElements.forEach(element => {
  motionElements[element] = createMotionComponent((props: any) => {
    if (typeof window === 'undefined') {
      // SSR fallback - render as regular HTML element
      const { initial, animate, exit, transition, whileHover, whileTap, ...otherProps } = props
      const Component = element as any
      return <Component {...otherProps} />
    }
    // Client-side - use framer motion
    return framerMotion[element](props)
  })
})

export const motion = motionElements

export function AnimatePresence({ children, ...props }: any) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return children
  }

  return framerAnimatePresence({ children, ...props })
}
