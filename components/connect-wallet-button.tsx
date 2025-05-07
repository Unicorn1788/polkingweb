"use client"

import { useState } from "react"
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useDisconnect } from 'wagmi'
import { useWalletErrorHandler } from "@/hooks/use-wallet-error-handler"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ConnectWalletButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const { handleError } = useWalletErrorHandler()

  const handleConnect = async () => {
    try {
      await open()
    } catch (error) {
      handleError(error)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast.success("Disconnected successfully")
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <div className="relative">
      <motion.button
        onClick={handleConnect}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium",
          "hover:from-purple-700 hover:to-blue-700 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isConnected ? (
          <>
            <span className="truncate max-w-[120px]">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <ChevronDown className="w-4 h-4" />
          </>
        ) : (
          "Connect Wallet"
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <div className="py-1">
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
              >
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
