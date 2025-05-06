"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export default function SkipLink() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setIsVisible(true)
      }
    }

    const handleClick = () => {
      setIsVisible(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <a
      href="#main-content"
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#a58af8] text-white rounded-md shadow-lg transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:ring-offset-2 focus:ring-offset-[#0a0118]",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
      )}
      onClick={() => setIsVisible(false)}
    >
      Skip to main content
    </a>
  )
} 
