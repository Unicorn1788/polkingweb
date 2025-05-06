"use client"

import { useWallet } from "@/context/wallet-context"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, Shield, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useConnect, useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi"
import { polygon } from "viem/chains"
import { useState, useEffect } from "react"
import { POLYGON_CHAIN_ID } from "@/lib/constants"
import Image from "next/image"

export function WalletModalContainer() {
  const { isWalletModalOpen, closeWalletModal } = useWallet()
  const { connectors, connectAsync, isPending, error: connectError } = useConnect()
  const { isConnected, address } = useAccount()
  const chainId = useChainId()
  const { switchChainAsync } = useSwitchChain()

  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connectionSuccess, setConnectionSuccess] = useState(false)

  // Check if connected to the wrong network
  const isWrongNetwork = isConnected && chainId !== Number(POLYGON_CHAIN_ID)

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isWalletModalOpen) {
      setError(null)
      setConnectionSuccess(false)
      setSelectedWallet(null)
    }
  }, [isWalletModalOpen])

  // Show success and close modal when connected
  useEffect(() => {
    if (isConnected && !isWrongNetwork && isWalletModalOpen) {
      setConnectionSuccess(true)
      const timer = setTimeout(() => {
        closeWalletModal()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isConnected, isWrongNetwork, isWalletModalOpen, closeWalletModal])

  // Handle wallet connection
  const handleConnect = async (connector: any) => {
    try {
      setSelectedWallet(connector.id)
      setError(null)

      // If already connected, just show success
      if (isConnected) {
        setConnectionSuccess(true)
        return
      }

      await connectAsync({
        connector,
        chainId: polygon.id,
      })
    } catch (err: any) {
      console.error("Connection error:", err)
      
      if (err.message?.includes("already connected")) {
        setConnectionSuccess(true)
        return
      }
      
      setError(err?.message || "Failed to connect wallet")
    }
  }

  return (
    <AnimatePresence>
      {isWalletModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWalletModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-md my-8 bg-[#0f0c1a] border border-[#a58af8]/30 rounded-xl sm:rounded-2xl shadow-xl"
            >
              {/* Success overlay */}
              <AnimatePresence>
                {connectionSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-20 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center p-3 rounded-xl sm:rounded-2xl"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="bg-green-500/20 rounded-full p-3 sm:p-4 mb-3"
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
                        className="text-xs sm:text-sm font-medium text-white/60 mt-1.5"
                      >
                        {address.slice(0, 6)}...{address.slice(-4)}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white">Connect Wallet</h2>
                  <button
                    onClick={closeWalletModal}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-[#0f0c1a]/70 border border-[#a58af8]/30 hover:border-[#a58af8]/60 transition-colors"
                  >
                    <span className="text-sm sm:text-base text-white/60 hover:text-white transition-colors">✕</span>
                  </button>
                </div>

                {/* Network Badge */}
                <div className="mb-4">
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-3 bg-[#a58af8]/10 rounded-full border border-[#a58af8]/30">
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
                      className="mb-4"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                        <p className="text-xs sm:text-sm text-red-400">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2 sm:space-y-3">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => handleConnect(connector)}
                      disabled={isPending && selectedWallet === connector.id}
                      className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1a1625] hover:bg-[#1f1b2d] border ${
                        selectedWallet === connector.id ? 'border-[#a58af8] bg-[#1f1b2d]' : 'border-[#a58af8]/30'
                      } rounded-lg sm:rounded-xl transition-colors relative`}
                    >
                      <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-[#a58af8]" />
                      <span className="text-sm sm:text-base text-white font-medium">
                        {connector.name}
                      </span>
                      {isPending && selectedWallet === connector.id && (
                        <Loader2 className="w-4 h-4 text-[#a58af8] animate-spin ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
} 
