interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class RateLimiter {
  private requests: Map<string, number[]>
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.requests = new Map()
    this.config = config
  }

  isRateLimited(key: string): boolean {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get existing requests for this key
    const requestTimestamps = this.requests.get(key) || []

    // Remove old requests outside the window
    const validRequests = requestTimestamps.filter(timestamp => timestamp > windowStart)

    // Check if we've exceeded the rate limit
    if (validRequests.length >= this.config.maxRequests) {
      return true
    }

    // Add new request
    validRequests.push(now)
    this.requests.set(key, validRequests)

    return false
  }

  getRemainingRequests(key: string): number {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    const requestTimestamps = this.requests.get(key) || []
    const validRequests = requestTimestamps.filter(timestamp => timestamp > windowStart)
    return Math.max(0, this.config.maxRequests - validRequests.length)
  }

  getResetTime(key: string): number {
    const requestTimestamps = this.requests.get(key) || []
    if (requestTimestamps.length === 0) return 0

    const oldestRequest = Math.min(...requestTimestamps)
    return oldestRequest + this.config.windowMs
  }
}

// Create a singleton instance with default config
export const rateLimiter = new RateLimiter({
  maxRequests: 100, // Maximum requests per window
  windowMs: 60 * 1000, // 1 minute window
})

// Helper function to check rate limit for API calls
export function checkRateLimit(key: string): { limited: boolean; remaining: number; resetTime: number } {
  const limited = rateLimiter.isRateLimited(key)
  const remaining = rateLimiter.getRemainingRequests(key)
  const resetTime = rateLimiter.getResetTime(key)

  return { limited, remaining, resetTime }
} 
