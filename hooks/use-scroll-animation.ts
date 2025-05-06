"use client"

import { useState, useEffect, useRef } from "react"

type UseScrollAnimationProps = {
  threshold?: number
  once?: boolean
}

export function useScrollAnimation({ threshold = 0.1, once = true }: UseScrollAnimationProps = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const entryRef = useRef<IntersectionObserverEntry>()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        entryRef.current = entry

        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) observer.unobserve(node)
        } else {
          if (!once) setIsVisible(false)
        }
      },
      { threshold },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
    }
  }, [threshold, once])

  return { ref, isVisible }
}
