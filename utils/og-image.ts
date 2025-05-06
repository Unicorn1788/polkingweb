"use client"

/**
 * Utility to generate dynamic Open Graph image URLs
 */
export function generateOgImageUrl(eventName: string, eventDate: Date): string {
  // Base URL for the OG image API (could be a real API endpoint in production)
  const baseUrl = "/api/og"

  // Format the date for display
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(eventDate)

  // Create the URL with query parameters
  const url = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "https://polking.com")
  url.searchParams.set("title", eventName)
  url.searchParams.set("date", formattedDate)

  return url.toString()
}

/**
 * Get the canonical URL for the current page
 */
export function getCanonicalUrl(path?: string): string {
  if (typeof window === "undefined") {
    return path || "/"
  }

  return `${window.location.origin}${path || window.location.pathname}`
}
