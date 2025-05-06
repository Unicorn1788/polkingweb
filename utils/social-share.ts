"use client"

// This file contains utility functions for social sharing

export interface ShareData {
  title: string
  text: string
  url: string
}

export type SocialPlatform = "twitter" | "facebook" | "whatsapp" | "telegram" | "email" | "native" | "copy" | "qr"

/**
 * Generate share data for a countdown
 */
export function generateCountdownShareData(eventName: string, targetDate: Date): ShareData {
  // Format the date for display
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(targetDate)

  // Calculate the URL with parameters
  const baseUrl = typeof window !== "undefined" ? window.location.origin + "/countdown" : ""
  const url = `${baseUrl}?event=${encodeURIComponent(eventName)}&date=${encodeURIComponent(targetDate.toISOString())}`

  return {
    title: `Countdown to ${eventName}`,
    text: `Check out this countdown to ${eventName} on ${formattedDate}!`,
    url,
  }
}

/**
 * Share content to various platforms
 */
export async function shareContent(data: ShareData, platform?: SocialPlatform): Promise<boolean> {
  // Try native sharing if no specific platform is provided
  if (!platform || platform === "native") {
    try {
      if (navigator.share) {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        })
        return true
      }
      return false
    } catch (error) {
      console.error("Error sharing:", error)
      return false
    }
  }

  // Platform-specific sharing
  switch (platform) {
    case "twitter":
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(data.url)}`,
        "_blank",
      )
      return true

    case "facebook":
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}&quote=${encodeURIComponent(
          data.text,
        )}`,
        "_blank",
      )
      return true

    case "whatsapp":
      window.open(`https://wa.me/?text=${encodeURIComponent(`${data.text} ${data.url}`)}`, "_blank")
      return true

    case "telegram":
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.text)}`,
        "_blank",
      )
      return true

    case "email":
      window.location.href = `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(
        `${data.text} ${data.url}`,
      )}`
      return true

    case "copy":
      try {
        await navigator.clipboard.writeText(`${data.text} ${data.url}`)
        return true
      } catch (error) {
        console.error("Failed to copy:", error)
        return false
      }

    default:
      return false
  }
}
