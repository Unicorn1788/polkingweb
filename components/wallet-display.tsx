"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, Save } from "lucide-react"
import { POLYGON_EXPLORER_URL } from "@/lib/constants"

export default function WalletDisplay() {
  const { address, disconnect, isConnected, isPersistenceEnabled, togglePersistence } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // View on explorer
  const viewOnExplorer = () => {
    if (address) {
      window.open(`${POLYGON_EXPLORER_URL}/address/${address}`, "_blank")
    }
  }

  if (!isConnected || !address) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#0f0824] rounded-full border border-[#a58af8]/30 hover:border-[#a58af8]/60 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-[#a58af8]/20 flex items-center justify-center">
          <Wallet className="w-3.5 h-3.5 text-[#a58af8]" />
        </div>
        <span className="text-sm text-white">{formatAddress(address)}</span>
        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
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
              className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f0c1a]/95 backdrop-blur-md border border-[#a58af8]/30 shadow-lg shadow-black/50 z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-[#a58af8]/20">
                <p className="text-xs text-white/50 mb-1">Connected Wallet</p>
                <p className="text-sm font-medium text-white break-all">{address}</p>
              </div>

              <div className="p-2">
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-[#a58af8]/10 rounded-lg transition-colors text-left"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copySuccess ? "Copied!" : "Copy Address"}</span>
                </button>

                <button
                  onClick={viewOnExplorer}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-[#a58af8]/10 rounded-lg transition-colors text-left"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Explorer</span>
                </button>

                {/* Persistence toggle */}
                <div className="flex items-center justify-between w-full px-3 py-2 text-sm text-white/70 hover:bg-[#a58af8]/10 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    <span>Remember Connection</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePersistence()
                    }}
                    className={`relative w-8 h-4 rounded-full transition-colors ${
                      isPersistenceEnabled ? "bg-[#a58af8]" : "bg-[#0f0c1a] border border-[#a58af8]/30"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                        isPersistenceEnabled ? "translate-x-4" : ""
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsDropdownOpen(false)
                    // Directly call disconnect - debouncing handled in context
                    disconnect()
                  }}
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
