"use client"

import { useState, useEffect, type RefObject } from "react"

interface SwipeGestureOptions {
  threshold?: number
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface SwipeState {
  swiping: boolean
  direction: "left" | "right" | "up" | "down" | null
  distance: number
}

export const useSwipeGesture = (ref: RefObject<HTMLElement>, options: SwipeGestureOptions = {}) => {
  const { threshold = 50, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown } = options

  const [swipeState, setSwipeState] = useState<SwipeState>({
    swiping: false,
    direction: null,
    distance: 0,
  })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let startX = 0
    let startY = 0
    let startTime = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      startTime = Date.now()

      setSwipeState({
        swiping: true,
        direction: null,
        distance: 0,
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeState.swiping) return

      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY

      const diffX = startX - currentX
      const diffY = startY - currentY

      const absX = Math.abs(diffX)
      const absY = Math.abs(diffY)

      // Determine if horizontal or vertical swipe
      if (absX > absY) {
        // Horizontal swipe
        const direction = diffX > 0 ? "left" : "right"
        setSwipeState({
          swiping: true,
          direction,
          distance: absX,
        })
      } else {
        // Vertical swipe
        const direction = diffY > 0 ? "up" : "down"
        setSwipeState({
          swiping: true,
          direction,
          distance: absY,
        })
      }
    }

    const handleTouchEnd = () => {
      const swipeDuration = Date.now() - startTime
      const isQuickSwipe = swipeDuration < 300

      // Only trigger if we've passed the threshold or it's a quick swipe
      if (swipeState.distance > threshold || (isQuickSwipe && swipeState.distance > threshold / 2)) {
        switch (swipeState.direction) {
          case "left":
            onSwipeLeft?.()
            break
          case "right":
            onSwipeRight?.()
            break
          case "up":
            onSwipeUp?.()
            break
          case "down":
            onSwipeDown?.()
            break
        }
      }

      setSwipeState({
        swiping: false,
        direction: null,
        distance: 0,
      })
    }

    element.addEventListener("touchstart", handleTouchStart)
    element.addEventListener("touchmove", handleTouchMove)
    element.addEventListener("touchend", handleTouchEnd)

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [ref, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, swipeState.swiping])

  return swipeState
}
