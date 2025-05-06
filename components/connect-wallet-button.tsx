"use client"
import { Wallet, LogOut, ChevronDown, Loader2, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/context/wallet-context"
import { useWalletErrorHandler } from "@/hooks/use-wallet-error-handler"
import { cn } from "@/lib/utils"
import { useToast } from "@/context/toast-context"

interface ConnectWalletButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  showAddress?: boolean
  className?: string
  mobileCompact?: boolean
}

export default function ConnectWalletButton({
  variant = "default",
  size = "md",
  showAddress = true,
  className = "",
  mobileCompact = false,
}: ConnectWalletButtonProps) {
  const { address, isConnected, isConnecting, connect, disconnect, openWalletModal } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { handleError } = useWalletErrorHandler()
  const [showConnectedAnimation, setShowConnectedAnimation] = useState(false)
  const { showToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Show connection success animation when connected
  useEffect(() => {
    if (isConnected) {
      setShowConnectedAnimation(true)
      const timer = setTimeout(() => {
        setShowConnectedAnimation(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

  // Button style based on variant and size
  const getButtonStyle = () => {
    let baseStyle = "flex items-center transition-all duration-300 "

    // Size styles
    if (size === "sm") {
      baseStyle += "text-xs px-3 py-1.5 gap-1.5 "
    } else if (size === "lg") {
      baseStyle += "text-base px-5 py-3 gap-2.5 "
    } else {
      baseStyle += "text-sm px-4 py-2 gap-2 "
    }

    // Variant styles
    if (variant === "outline") {
      baseStyle += "border border-[#a58af8]/30 hover:border-[#a58af8]/60 bg-transparent text-white rounded-full "
    } else if (variant === "ghost") {
      baseStyle += "bg-transparent hover:bg-[#a58af8]/10 text-white rounded-full "
    } else {
      baseStyle += "bg-[#0f0824] border border-[#a58af8]/30 hover:border-[#a58af8]/60 rounded-full "
    }

    return baseStyle + className
  }

  // Handle connect click with error handling
  const handleConnect = async () => {
    try {
      setIsLoading(true)
      await openWalletModal()
    } catch (error) {
      showToast({
        type: "error",
        title: "Connection Error",
        message: "Failed to connect wallet. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle disconnect with error handling
  const handleDisconnect = () => {
    try {
      disconnect()
      setIsDropdownOpen(false)

      // Show toast notification
      showToast({
        type: "info",
        title: "Wallet Disconnected",
        message: "Your wallet has been disconnected",
        duration: 3000,
      })
    } catch (error) {
      handleError(error, { component: "ConnectWalletButton", action: "disconnect" })
    }
  }

  // Determine if we should show compact version on mobile
  const showCompact = mobileCompact && typeof window !== "undefined" && window.innerWidth < 640

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className={`${getButtonStyle()} ${isLoading ? "opacity-80" : ""} relative overflow-hidden ${
          mobileCompact ? "w-full" : ""
        }`}
        aria-label="Connect wallet"
      >
        {isLoading ? (
          <Loader2
            className={`${size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-[#a58af8] animate-spin`}
          />
        ) : (
          <Wallet
            className={`${size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-[#a58af8]`}
          />
        )}

        <span
          className={cn(
            "font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15]",
            showCompact && "hidden sm:inline",
          )}
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </span>

        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#a58af8]/10 via-[#a58af8]/20 to-[#a58af8]/10"
          animate={{
            x: ["0%", "100%", "0%"],
          }}
          transition={{
            duration: 3,
            ease: "linear",
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </button>
    )
  }

  if (showAddress) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={getButtonStyle()}
          aria-label={isDropdownOpen ? "Close wallet menu" : "Open wallet menu"}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <div
            className={`${size === "sm" ? "w-5 h-5" : size === "lg" ? "w-7 h-7" : "w-6 h-6"} rounded-full bg-[#a58af8]/20 flex items-center justify-center relative`}
          >
            {showConnectedAnimation ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <CheckCircle2
                  className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} text-green-400`}
                />
              </motion.div>
            ) : (
              <Wallet
                className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} text-[#a58af8]`}
              />
            )}
          </div>
          <span className={cn("text-white", showCompact && "hidden sm:inline")}>
            {formatAddress(address || "")}
          </span>
          <ChevronDown
            className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"} text-white/60 transition-transform ${isDropdownOpen ? "rotate-180" : ""} ${showCompact ? "ml-0 sm:ml-1" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Backdrop for closing dropdown when clicking outside */}
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />

              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0f0c1a]/95 backdrop-blur-md border border-[#a58af8]/30 shadow-lg shadow-black/50 z-50 overflow-hidden"
                style={{
                  maxWidth: "calc(100vw - 24px)",
                  right: showCompact ? "-12px" : "0",
                }}
              >
                <div className="p-3 border-b border-[#a58af8]/20">
                  <p className="text-xs text-white/50 mb-1">Connected Wallet</p>
                  <p className="text-sm font-medium text-white break-all">{formatAddress(address || "")}</p>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Simple connected button without address
  return (
    <div className="flex gap-2">
      <button
        className={getButtonStyle()}
        aria-label="Wallet connected"
      >
        <div
          className={`${size === "sm" ? "w-5 h-5" : size === "lg" ? "w-7 h-7" : "w-6 h-6"} rounded-full bg-[#a58af8]/20 flex items-center justify-center`}
        >
          <Wallet
            className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} text-[#a58af8]`}
          />
        </div>
        <span className={cn("text-white", showCompact && "hidden sm:inline")}>
          Connected
        </span>
      </button>

      <button
        onClick={handleDisconnect}
        className={`${size === "sm" ? "p-1.5" : size === "lg" ? "p-3" : "p-2"} rounded-full bg-[#0f0824] border border-red-400/30 hover:border-red-400/60 transition-all duration-300`}
        aria-label="Disconnect wallet"
      >
        <LogOut className={`${size === "sm" ? "w-3 h-3" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} text-red-400`} />
      </button>
    </div>
  )
}
