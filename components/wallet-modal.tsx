"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Shield, ExternalLink, AlertCircle, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { useConnect, useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { polygon } from "viem/chains"
import { POLYGON_CHAIN_ID } from "@/lib/constants"

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function WalletModal({ isOpen, onClose, onSuccess }: WalletModalProps) {
  const { connectors, connectAsync, isPending, error: connectError } = useConnect()
  const { isConnected, address } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const chainId = useChainId()
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain()

  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [connectionSuccess, setConnectionSuccess] = useState(false)

  // Check if connected to the wrong network
  const isWrongNetwork = isConnected && chainId !== Number(POLYGON_CHAIN_ID)

  // Close modal when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEsc)
    }

    return () => {
      document.removeEventListener("keydown", handleEsc)
    }
  }, [isOpen, onClose])

  // Show success animation before closing modal
  useEffect(() => {
    if (isConnected && !isWrongNetwork && isOpen) {
      setConnectionSuccess(true)

      // Show success animation for a moment before closing
      const timer = setTimeout(() => {
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isConnected, isWrongNetwork, isOpen, onClose, onSuccess])

  // Reset error and success state when modal opens/closes
  useEffect(() => {
    setError(null)
    setConnectionSuccess(false)
    
    // If wallet is already connected when modal opens, show success directly
    if (isConnected && isOpen && !isWrongNetwork) {
      setConnectionSuccess(true)
      const timer = setTimeout(() => {
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, isConnected, isWrongNetwork, onClose, onSuccess])

  // Handle connection errors
  useEffect(() => {
    if (connectError) {
      let errorMessage = "Failed to connect wallet"

      if (connectError.message) {
        if (connectError.message.includes("rejected")) {
          errorMessage = "Connection rejected. Please approve the connection request in your wallet."
        } else if (connectError.message.includes("user denied")) {
          errorMessage = "You denied the connection request."
        } else if (connectError.message.includes("already connected")) {
          // Just show success for already connected errors
          setConnectionSuccess(true)
          const timer = setTimeout(() => {
            onClose()
            if (onSuccess) {
              onSuccess()
            }
          }, 1500)
          return () => clearTimeout(timer)
        } else {
          errorMessage = connectError.message
        }
      }

      setError(errorMessage)
    }
  }, [connectError, onClose, onSuccess])

  // Handle wallet selection and connection
  const handleWalletSelect = useCallback(
    async (connector: any) => {
      try {
        setSelectedWallet(connector.id)
        setError(null)

        // If already connected with this connector, just show success
        if (isConnected) {
          setConnectionSuccess(true)
          return
        }

        // Connect with a try-catch to handle potential errors
        await connectAsync({
          connector,
          chainId: polygon.id,
        })
      } catch (err: any) {
        console.error("Connection error:", err)
        
        // If the error is because wallet is already connected, treat as success
        if (err.message?.includes("already connected")) {
          setConnectionSuccess(true)
          return
        }
        
        setError(err?.message || "Failed to connect wallet")
      }
    },
    [connectAsync, isConnected],
  )

  // Handle image error
  const handleImageError = (walletId: string) => {
    setImageErrors((prev) => ({ ...prev, [walletId]: true }))
  }

  // Get wallet icon based on connector ID
  const getWalletIcon = (connectorId: string) => {
    const icons: Record<string, string> = {
      metaMask: "/images/wallets/metamask.svg",
      walletConnect: "/images/wallets/walletconnect.svg",
      tokenpocket: "/images/wallets/tokenpocket.svg",
      phantom: "/images/wallets/phantom.svg",
    }

    return icons[connectorId] || "/images/wallets/metamask.svg"
  }

  // Get wallet name based on connector ID
  const getWalletName = (connectorId: string) => {
    const names: Record<string, string> = {
      metaMask: "MetaMask",
      walletConnect: "WalletConnect",
      tokenpocket: "TokenPocket",
      phantom: "Phantom",
    }

    return names[connectorId] || "Browser Wallet"
  }

  // Render wallet icon
  const renderWalletIcon = (connectorId: string) => {
    if (imageErrors[connectorId]) {
      return (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0f0c1a] border border-[#a58af8]/40 flex items-center justify-center">
          <span className="text-[#facc15] text-xs font-bold">{getWalletName(connectorId).substring(0, 2)}</span>
        </div>
      )
    }

    return (
      <Image
        src={getWalletIcon(connectorId) || "/placeholder.svg"}
        alt={getWalletName(connectorId)}
        width={32}
        height={32}
        className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
        onError={() => handleImageError(connectorId)}
      />
    )
  }

  // Filter out problematic connectors if needed
  const availableConnectors = connectors.filter(
    (connector) =>
      // You can add conditions here if certain connectors are causing issues
      connector.id !== "broken-connector-id",
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-md my-8"
            >
              <div className="rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f0c1a] to-[#0a0118] border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)] flex flex-col">
                {/* Success overlay */}
                <AnimatePresence>
                  {connectionSuccess && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-3"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 15 }}
                        className="bg-green-500/20 rounded-full p-3 sm:p-4 mb-3 sm:mb-4"
                      >
                        <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-400" />
                      </motion.div>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base sm:text-lg font-medium text-white"
                      >
                        Connected Successfully
                      </motion.p>
                      {address && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-xs sm:text-sm font-medium text-white/60 mt-1.5 sm:mt-2"
                        >
                          {address.slice(0, 6)}...{address.slice(-4)}
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Header */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 md:p-5 border-b border-[#a58af8]/20 bg-[#0f0c1a] z-10">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Connect Wallet</h3>
                  <button
                    onClick={onClose}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-[#0f0c1a]/70 border border-[#a58af8]/30 hover:border-[#a58af8]/60 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70" />
                  </button>
                </div>

                {/* Network Badge */}
                <div className="px-2.5 sm:px-3 md:px-5 pt-2.5 sm:pt-3 md:pt-5 pb-1.5 sm:pb-2">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2.5 sm:px-3 md:px-4 bg-[#a58af8]/10 rounded-full border border-[#a58af8]/30 mb-1.5 sm:mb-2 md:mb-3">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a58af8]" />
                    <span className="text-xs sm:text-sm font-medium text-white">Polygon Mainnet</span>
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-2.5 sm:px-3 md:px-5"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-2 sm:mb-3">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                        <p className="text-xs sm:text-sm text-red-400">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Wallet List */}
                <div className="flex-1 overflow-y-auto min-h-0 -webkit-overflow-scrolling-touch">
                  <div className="p-2.5 sm:p-3 md:p-5 pt-1.5 sm:pt-2">
                    <div className="grid grid-cols-1 gap-1.5 sm:gap-2 md:gap-3">
                      {availableConnectors.map((connector) => (
                        <motion.button
                          key={connector.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleWalletSelect(connector)}
                          disabled={isPending && selectedWallet === connector.id}
                          className={`flex items-center gap-2 sm:gap-4 w-full p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border transition-all ${
                            selectedWallet === connector.id
                              ? "bg-[#a58af8]/20 border-[#a58af8]/50"
                              : "bg-[#0f0c1a]/50 border-[#a58af8]/20 hover:border-[#a58af8]/40"
                          }`}
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            {renderWalletIcon(connector.id)}
                            <span className="text-sm sm:text-base font-medium">{getWalletName(connector.id)}</span>
                          </div>

                          {/* Loading indicator */}
                          {isPending && selectedWallet === connector.id && (
                            <div className="ml-auto">
                              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a58af8] animate-spin" />
                            </div>
                          )}

                          {/* Animated gradient line on hover */}
                          <div className="relative flex-1 h-px">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#a58af8]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Info text */}
                    <p className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-white/50 text-center px-2">
                      By connecting your wallet, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-2.5 sm:p-3 md:p-4 bg-[#0f0c1a]/50 border-t border-[#a58af8]/20 text-center z-10">
                  <a
                    href="https://ethereum.org/en/wallets/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm text-[#a58af8] hover:text-[#facc15] transition-colors"
                  >
                    Learn more about wallets
                    <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
} 
