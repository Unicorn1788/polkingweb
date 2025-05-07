"use client"

import { useState, useEffect } from "react"
import { ConnectWalletButton } from "./connect-wallet-button"
import Link from "next/link"
import Image from "next/image"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-[#0d0522]/90 backdrop-blur-md shadow-lg" : "bg-[#0a0118]/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/polking-logo.png"
                alt="Polking Logo"
                width={40}
                height={40}
                priority
                className="rounded-full bg-[#0a0118] p-1 shadow-md"
              />
              <span className="hidden sm:inline text-white font-bold text-xl tracking-wide">Polking</span>
            </Link>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
