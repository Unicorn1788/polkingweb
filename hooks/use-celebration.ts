"use client"

import { useState, useCallback } from "react"

interface CelebrationOptions {
  duration?: number
  intensity?: "low" | "medium" | "high"
  colors?: string[]
}

export function useCelebration(defaultOptions?: CelebrationOptions) {
  const [isActive, setIsActive] = useState(false)
  const [options, setOptions] = useState<CelebrationOptions>(defaultOptions || {})

  const celebrate = useCallback(
    (customOptions?: CelebrationOptions) => {
      // Merge default options with custom options
      if (customOptions) {
        setOptions((prev) => ({ ...prev, ...customOptions }))
      }

      // Activate the celebration
      setIsActive(true)

      // Return a promise that resolves when the celebration is complete
      return new Promise<void>((resolve) => {
        const duration = customOptions?.duration || defaultOptions?.duration || 3000
        setTimeout(() => {
          setIsActive(false)
          resolve()
        }, duration)
      })
    },
    [defaultOptions],
  )

  const stopCelebration = useCallback(() => {
    setIsActive(false)
  }, [])

  return {
    isActive,
    celebrate,
    stopCelebration,
    options,
  }
}
