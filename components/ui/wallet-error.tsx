"use client"

import type React from "react"
import { AlertCircle, XCircle, WifiOff, ShieldAlert, HelpCircle, RefreshCw } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export type WalletErrorType = "rejected" | "unavailable" | "network" | "unsupported" | "timeout" | "unknown"

interface WalletErrorProps {
  type: WalletErrorType
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}

export function WalletError({ type, message, onRetry, onDismiss, className = "" }: WalletErrorProps) {
  const [dismissed, setDismissed] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleRetry = () => {
    setIsRetrying(true)

    // Add a small delay to show the loading state
    setTimeout(() => {
      onRetry?.()
      setIsRetrying(false)
    }, 500)
  }

  // Default messages based on error type
  const defaultMessages: Record<WalletErrorType, string> = {
    rejected: "You rejected the connection request. Please approve the connection in your wallet.",
    unavailable: "Wallet not detected. Please install a wallet extension or open in a wallet browser.",
    network: "Network connection issue. Please check your internet connection and try again.",
    unsupported: "This wallet or chain is not supported by this application.",
    timeout: "Connection request timed out. Please try again.",
    unknown: "An unknown error occurred while connecting to your wallet.",
  }

  // Icons based on error type
  const icons: Record<WalletErrorType, React.ReactNode> = {
    rejected: <XCircle className="w-5 h-5 text-red-400" />,
    unavailable: <ShieldAlert className="w-5 h-5 text-amber-400" />,
    network: <WifiOff className="w-5 h-5 text-red-400" />,
    unsupported: <AlertCircle className="w-5 h-5 text-amber-400" />,
    timeout: <AlertCircle className="w-5 h-5 text-amber-400" />,
    unknown: <HelpCircle className="w-5 h-5 text-amber-400" />,
  }

  // Colors based on error type
  const colors: Record<WalletErrorType, { bg: string; border: string; shadow: string }> = {
    rejected: { bg: "bg-red-500/10", border: "border-red-500/30", shadow: "shadow-red-500/10" },
    unavailable: { bg: "bg-amber-500/10", border: "border-amber-500/30", shadow: "shadow-amber-500/10" },
    network: { bg: "bg-red-500/10", border: "border-red-500/30", shadow: "shadow-red-500/10" },
    unsupported: { bg: "bg-amber-500/10", border: "border-amber-500/30", shadow: "shadow-amber-500/10" },
    timeout: { bg: "bg-amber-500/10", border: "border-amber-500/30", shadow: "shadow-amber-500/10" },
    unknown: { bg: "bg-amber-500/10", border: "border-amber-500/30", shadow: "shadow-amber-500/10" },
  }

  const displayMessage = message || defaultMessages[type]
  const { bg, border, shadow } = colors[type]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`p-3 rounded-lg ${bg} ${border} ${shadow} shadow-lg ${className}`}
      >
        <div className="flex items-start gap-3">
          <motion.div
            className="flex-shrink-0 mt-0.5"
            animate={{
              rotate: type === "network" ? [0, 5, -5, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              repeat: type === "network" ? Number.POSITIVE_INFINITY : 0,
              repeatDelay: 3,
            }}
          >
            {icons[type]}
          </motion.div>
          <div className="flex-1">
            <p className="text-sm text-white/90 mb-2">{displayMessage}</p>
            <div className="flex flex-wrap gap-2">
              {onRetry && (
                <motion.button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-xs px-3 py-1.5 bg-[#a58af8]/20 hover:bg-[#a58af8]/30 rounded-lg text-[#a58af8] transition-colors flex items-center gap-1.5"
                >
                  {isRetrying ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <RefreshCw className="w-3 h-3" />
                    </motion.div>
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  <span>{isRetrying ? "Retrying..." : "Try Again"}</span>
                </motion.button>
              )}
              <motion.button
                onClick={handleDismiss}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 transition-colors"
              >
                Dismiss
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
