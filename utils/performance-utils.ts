/**
 * Utility functions for performance optimization
 */

/**
 * Throttle function to limit the rate at which a function is executed
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false
  let lastFunc: ReturnType<typeof setTimeout> | null = null
  let lastRan = 0

  return function (this: any, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args)
      lastRan = Date.now()
      inThrottle = true

      setTimeout(() => {
        inThrottle = false
        if (lastFunc) {
          lastFunc = null
          func.apply(this, args)
        }
      }, limit)
    } else {
      if (lastFunc) clearTimeout(lastFunc)
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan),
      )
    }
  }
}

/**
 * Debounce function to delay execution until after a period of inactivity
 * @param func - The function to debounce
 * @param wait - The wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout)

    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

/**
 * Check if the device is a low-end device
 * @returns Boolean indicating if the device is low-end
 */
export function isLowEndDevice(): boolean {
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
  return (lowMemory && lowCores) || (lowMemory && slowConnection) || (lowCores && slowConnection)
}

/**
 * Check if the device is mobile
 * @returns Boolean indicating if the device is mobile
 */
export function isMobileDevice(): boolean {
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== "undefined" && window.innerWidth < 768)
  )
}

/**
 * Check if the user prefers reduced motion
 * @returns Boolean indicating if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}
