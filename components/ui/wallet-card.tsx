/**
 * @file wallet-card.tsx
 * @description Wallet display and management component
 * 
 * This component displays the connected wallet information and provides
 * functionality for wallet disconnection and address copying.
 * 
 * IMPORTANT: When updating wallet functionality:
 * 1. Keep using Reown AppKit for wallet interactions
 * 2. Maintain existing error handling patterns
 * 3. Keep current UI/UX patterns
 */

"use client"

import { useAppKitAccount } from '@reown/appkit/react'
import { useDisconnect } from 'wagmi'
import { motion } from "framer-motion"
import { useToast } from "@/context/toast-context"
import { Wallet, Copy, ExternalLink, LogOut, Save, ChevronDown } from "lucide-react"
import { getAddressUrl } from "@/utils/transaction"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import WalletConnectionStatus from "@/components/wallet-connection-status"

/**
 * WalletCard Component
 * Displays wallet information and provides wallet management functionality
 * 
 * Features:
 * - Display connected wallet address
 * - Copy address to clipboard
 * - View address on explorer
 * - Disconnect wallet
 * - Show connection status
 */
export function WalletCard() {
  const { address, isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const { showToast } = useToast()

  /**
   * Handle wallet disconnection
   * Shows success/error toast notifications
   */
  const handleDisconnect = async () => {
    try {
      await disconnect()
      showToast({
        type: "success",
        title: "Success",
        message: "Successfully disconnected wallet"
      })
    } catch (error) {
      console.error("Disconnect error:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to disconnect wallet. Please try again."
      })
    }
  }

  if (!isConnected || !address) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg shadow-lg p-4"
    >
      <div className="flex items-center justify-between">
        <div className="text-gray-300">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={handleDisconnect}
          className="text-gray-300 hover:text-white transition-colors"
        >
          Disconnect
        </button>
      </div>
    </motion.div>
  )
}
