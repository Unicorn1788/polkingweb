"use client"

import { useState, useEffect } from "react"

type PerformanceLevel = "high" | "medium" | "low"

/**
 * Hook to detect device performance capabilities and set appropriate animation levels
 * @returns Performance level and reduced motion preference
 */
export function usePerformanceMode() {
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>("medium")
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(motionQuery.matches)

    // Listen for changes to motion preference
    const updateMotionPreference = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    motionQuery.addEventListener("change", updateMotionPreference)

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
          window.innerWidth < 768,
      )
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Check for low-end device indicators
    const checkDevicePerformance = () => {
      // Check for device memory API (Chrome only)
      const memory = (navigator as any).deviceMemory
      const lowMemory = memory !== undefined && memory <= 4

      // Check for hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 4
      const lowCores = cores <= 4

      // Check for connection type
      const connection = (navigator as any).connection
      const slowConnection = connection && (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g")

      // Set low-end device flag if multiple indicators are true
      const isLowEnd = (lowMemory && lowCores) || (lowMemory && slowConnection) || (lowCores && slowConnection)
      setIsLowEndDevice(isLowEnd)

      // Set performance level based on device capabilities
      if (isLowEnd || prefersReducedMotion) {
        setPerformanceLevel("low")
      } else if (isMobile) {
        setPerformanceLevel("medium")
      } else {
        setPerformanceLevel("high")
      }
    }
    checkDevicePerformance()

    // Cleanup
    return () => {
      motionQuery.removeEventListener("change", updateMotionPreference)
      window.removeEventListener("resize", checkMobile)
    }
  }, [prefersReducedMotion, isMobile])

  return {
    performanceLevel,
    prefersReducedMotion,
    isMobile,
    isLowEndDevice,
  }
}
