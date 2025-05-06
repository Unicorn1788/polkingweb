"use client"

/**
 * Calculate time left until a target date
 */
export function calculateTimeLeft(targetDate: Date) {
  const now = new Date()
  const difference = targetDate.getTime() - now.getTime()

  // Default values if the date has passed
  let days = 0
  let hours = 0
  let minutes = 0
  let seconds = 0

  if (difference > 0) {
    days = Math.floor(difference / (1000 * 60 * 60 * 24))
    hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    seconds = Math.floor((difference % (1000 * 60)) / 1000)
  }

  return {
    days,
    hours,
    minutes,
    seconds,
    total: difference,
    isComplete: difference <= 0,
  }
}

/**
 * Format time units for display
 */
export function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, "0")
}

/**
 * Get a human-readable time remaining string
 */
export function getHumanReadableTimeRemaining(targetDate: Date): string {
  const { days, hours, minutes, seconds, isComplete } = calculateTimeLeft(targetDate)

  if (isComplete) {
    return "Event has already occurred"
  }

  const parts = []

  if (days > 0) {
    parts.push(`${days} day${days !== 1 ? "s" : ""}`)
  }

  if (hours > 0 || days > 0) {
    parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`)
  }

  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`)
  }

  parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`)

  return parts.join(", ")
}
