"use client"

import { useAppKitAccount } from '@reown/appkit/react'
import { useDisconnect } from 'wagmi'
import { motion } from "framer-motion"
import { useToast } from "@/context/toast-context"

export function WalletDisplay() {
  const { address, isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const { showToast } = useToast()

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
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-4">
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
