"use client"

import { useAppKit } from '@reown/appkit/react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useDisconnect } from 'wagmi'
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { toast } from "sonner"

export function WalletModalContainer() {
  const { open, close } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast.success("Disconnected successfully")
      close()
    } catch (error) {
      console.error("Disconnect error:", error)
      toast.error("Failed to disconnect. Please try again.")
    }
  }

  return (
    <AnimatePresence>
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-4">
            <button
              onClick={handleDisconnect}
              className="text-gray-300 hover:text-white transition-colors"
            >
              Disconnect
            </button>
            <button
              onClick={() => close()}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 
