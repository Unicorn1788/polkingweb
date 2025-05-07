/**
 * @file wallet-connection-status.tsx
 * @description Wallet connection status indicator component
 * 
 * This component displays the current wallet connection status,
 * including network validation and connection state.
 * 
 * IMPORTANT: When updating network configuration:
 * 1. Update POLYGON_CHAIN_ID in wagmi-config.ts
 * 2. Update network validation logic if needed
 */

"use client"

import { useAccount, useChainId } from "wagmi"
import { POLYGON_CHAIN_ID } from "@/lib/wagmi-config"
import { CheckCircle2, AlertTriangle, Loader2, WifiOff } from "lucide-react"
import { motion } from "framer-motion"

interface WalletConnectionStatusProps {
  showLabel?: boolean
  showTooltip?: boolean
  className?: string
}

/**
 * WalletConnectionStatus Component
 * Displays the current wallet connection status with network validation
 * 
 * @param {boolean} showLabel - Whether to show the status label
 * @param {boolean} showTooltip - Whether to show the tooltip on hover
 * @param {string} className - Additional CSS classes
 */
export default function WalletConnectionStatus({
  showLabel = true,
  showTooltip = false,
  className = "",
}: WalletConnectionStatusProps) {
  const { isConnected, isConnecting } = useAccount()
  const chainId = useChainId()

  const isWrongNetwork = isConnected && chainId !== POLYGON_CHAIN_ID

  /**
   * Get tooltip content based on connection status
   * @returns {string} Tooltip message
   */
  const getTooltipContent = () => {
    if (isConnecting) return "Connecting to wallet..."
    if (!isConnected) return "Wallet not connected"
    if (isWrongNetwork) return "Please switch to Polygon network"
    return "Connected to Polygon network"
  }

  // Loading state
  if (isConnecting) {
    return (
      <div className={`relative flex items-center gap-1.5 ${className}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <Loader2 className="w-4 h-4 text-[#a58af8]" />
        </motion.div>
        {showLabel && <span className="text-sm text-white/70">Connecting...</span>}

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#0f0c1a] border border-[#a58af8]/30 rounded text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {getTooltipContent()}
          </div>
        )}
      </div>
    )
  }

  // Disconnected state
  if (!isConnected) {
    return (
      <div className={`relative group flex items-center gap-1.5 ${className}`}>
        <motion.div
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <WifiOff className="w-4 h-4 text-white/50" />
        </motion.div>
        {showLabel && <span className="text-sm text-white/50">Not connected</span>}

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#0f0c1a] border border-[#a58af8]/30 rounded text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {getTooltipContent()}
          </div>
        )}
      </div>
    )
  }

  // Wrong network state
  if (isWrongNetwork) {
    return (
      <div className={`relative group flex items-center gap-1.5 ${className}`}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </motion.div>
        {showLabel && <span className="text-sm text-amber-400">Wrong network</span>}

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#0f0c1a] border border-amber-400/30 rounded text-xs text-amber-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {getTooltipContent()}
          </div>
        )}
      </div>
    )
  }

  // Connected state
  return (
    <div className={`relative group flex items-center gap-1.5 ${className}`}>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <CheckCircle2 className="w-4 h-4 text-green-400" />
      </motion.div>
      {showLabel && <span className="text-sm text-green-400">Connected</span>}

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-[#0f0c1a] border border-green-400/30 rounded text-xs text-green-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {getTooltipContent()}
        </div>
      )}
    </div>
  )
}
