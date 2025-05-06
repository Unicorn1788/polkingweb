"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { useWallet } from "@/context/wallet-context"
import ConnectWalletButton from "./connect-wallet-button"
import Notification from "./notification"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { openWalletModal, isConnected } = useWallet()
  const pathname = usePathname()
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 0)

  // Window resize effect
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Memoized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 10
    if (isScrolled !== scrolled) {
      setIsScrolled(scrolled)
    }
  }, [isScrolled])

  // Handle scroll events with improved throttling
  useEffect(() => {
    if (typeof window === "undefined") return
    
    let scrollTimeout: number | null = null
    
    const throttledScrollHandler = () => {
      if (scrollTimeout === null) {
        scrollTimeout = window.setTimeout(() => {
          handleScroll()
          scrollTimeout = null
        }, 100)
      }
    }

    window.addEventListener("scroll", throttledScrollHandler, { passive: true })
    
    // Initialize scroll state
    handleScroll()
    
    return () => {
      window.removeEventListener("scroll", throttledScrollHandler)
      if (scrollTimeout) window.clearTimeout(scrollTimeout)
    }
  }, [handleScroll])

  // Determine if we're on a very small screen
  const isVerySmallScreen = windowWidth < 360

  return (
    <header
      className={cn(
        "w-full fixed top-0 z-50 transition-all duration-500",
        isScrolled ? "py-2" : "py-3",
        isScrolled ? "bg-[#0d0d22]/90" : "bg-[#0d0d22]/70",
        !isScrolled ? "border-b border-white/10" : ""
      )}
    >
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 flex justify-between items-center h-12 relative">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 xs:gap-2 group z-20"
        >
          <div className="relative">
            <div
              className={cn(
                "relative flex items-center justify-center",
                isVerySmallScreen ? "h-7 w-7" : "h-8 w-8 xs:h-9 xs:w-9"
              )}
            >
              <Image
                src="/images/polking-logo.png"
                alt="POLKING"
                width={isVerySmallScreen ? 28 : 36}
                height={isVerySmallScreen ? 28 : 36}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <span
            className={cn(
              "font-bold tracking-wide bg-gradient-to-r from-white via-purple-400 to-yellow-400 bg-clip-text text-transparent",
              isVerySmallScreen ? "text-base" : "text-lg xs:text-xl"
            )}
          >
            POLKING
          </span>
        </Link>

        {/* Right side items */}
        <div className="flex items-center gap-4">
          <Notification variant="bell" />
          <ConnectWalletButton mobileCompact={isVerySmallScreen} />
        </div>
      </div>
    </header>
  )
}
