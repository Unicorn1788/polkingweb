"use client"

import { useEffect } from "react"
import { getCanonicalUrl } from "@/utils/og-image"

interface DynamicMetaTagsProps {
  title: string
  description: string
  imageUrl: string
  url?: string
}

export default function DynamicMetaTags({ title, description, imageUrl, url }: DynamicMetaTagsProps) {
  const canonicalUrl = url || getCanonicalUrl()

  // Update meta tags when props change
  useEffect(() => {
    // Update title
    document.title = title

    // Update meta tags
    updateMetaTag("description", description)
    updateMetaTag("og:title", title)
    updateMetaTag("og:description", description)
    updateMetaTag("og:image", imageUrl)
    updateMetaTag("og:url", canonicalUrl)
    updateMetaTag("twitter:title", title)
    updateMetaTag("twitter:description", description)
    updateMetaTag("twitter:image", imageUrl)

    // Add canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement("link")
      canonicalLink.setAttribute("rel", "canonical")
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute("href", canonicalUrl)

    // Cleanup function
    return () => {
      // No cleanup needed as we want meta tags to persist
    }
  }, [title, description, imageUrl, canonicalUrl])

  return null
}

// Helper function to update meta tags
function updateMetaTag(name: string, content: string) {
  // Try to find existing meta tag
  let metaTag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)

  // Create new meta tag if it doesn't exist
  if (!metaTag) {
    metaTag = document.createElement("meta")
    if (name.startsWith("og:") || name.startsWith("twitter:")) {
      metaTag.setAttribute("property", name)
    } else {
      metaTag.setAttribute("name", name)
    }
    document.head.appendChild(metaTag)
  }

  // Update content
  metaTag.setAttribute("content", content)
}
