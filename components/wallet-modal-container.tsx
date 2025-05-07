"use client"

import { useWallet } from "@/context/wallet-context"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { useConnect, useAccount, useChainId } from "wagmi"
import { polygon } from "viem/chains"
import { useCallback, useMemo } from "react"
import { POLYGON_CHAIN_ID } from "@/lib/constants"
import { logger } from "@/lib/logger"
import type { Connector } from "wagmi"

// Wallet icons mapping
const WALLET_ICONS = {
  metaMask: "/images/wallets/metamask.svg",
  walletConnect: "/images/wallets/walletconnect.svg",
  tokenPocket: "/images/wallets/tokenpocket.svg",
  coinbaseWallet: "/images/wallets/@coinbase.svg",
  phantom: "/images/wallets/phantom.svg",
  default: "/images/wallets/default.svg"
} as const

export function WalletModalContainer() {
  const { 
    isWalletModalOpen, 
    closeWalletModal, 
    handleWalletConnect,
    selectedWallet,
    connectionSuccess,
    error,
    address,
    isPending
  } = useWallet()
  const { connectors } = useConnect()
  const { isConnected } = useAccount()
  const chainId = useChainId()

  // Check if connected to the wrong network
  const isWrongNetwork = useMemo(() => 
    isConnected && chainId !== Number(POLYGON_CHAIN_ID),
    [isConnected, chainId]
  )

  // Filter and sort connectors
  const sortedConnectors = useMemo(() => {
    // Create a map to store unique connectors by their name (not ID)
    const uniqueConnectors = new Map()
    
    connectors.forEach(connector => {
      // Use connector name as the key to prevent duplicates with same name
      if (!uniqueConnectors.has(connector.name)) {
        uniqueConnectors.set(connector.name, connector)
      }
    })
    
    return Array.from(uniqueConnectors.values())
      .sort((a: Connector, b: Connector) => {
        // Prioritize MetaMask, WalletConnect, and Coinbase
        if (a.id === "metaMask") return -1
        if (b.id === "metaMask") return 1
        if (a.id === "walletConnect") return -1
        if (b.id === "walletConnect") return 1
        if (a.id === "coinbaseWallet") return -1
        if (b.id === "coinbaseWallet") return 1
        return 0
      })
  }, [connectors])

  // Get wallet icon
  const getWalletIcon = useCallback((connector: Connector) => {
    // Map connector IDs to icon keys
    const iconMapping: Record<string, keyof typeof WALLET_ICONS> = {
      'injected': 'metaMask',
      'metaMask': 'metaMask',
      'walletConnect': 'walletConnect',
      'coinbaseWallet': 'coinbaseWallet',
      'tokenPocket': 'tokenPocket',
      'phantom': 'phantom'
    }
    
    const iconKey = iconMapping[connector.id] || 'default'
    return WALLET_ICONS[iconKey]
  }, [])

  if (!isWalletModalOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isWalletModalOpen && (
        <>
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWalletModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-md my-8 bg-[#0f0c1a] border border-[#a58af8]/30 rounded-xl sm:rounded-2xl shadow-xl"
            >
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white">Connect Wallet</h2>
                  <button
                    onClick={closeWalletModal}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-[#0f0c1a]/70 border border-[#a58af8]/30 hover:border-[#a58af8]/60 transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60 hover:text-white transition-colors" />
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
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error-message"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                        <p className="text-xs sm:text-sm text-red-400">{error.message}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Wallet List */}
                <div className="space-y-2 sm:space-y-3">
                  {sortedConnectors.map((connector: Connector) => (
                    <motion.button
                      key={`wallet-${connector.id}`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWalletConnect(connector.id)}
                      disabled={isPending && selectedWallet === connector.id}
                      className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-[#1a1625] hover:bg-[#1f1b2d] border ${
                        selectedWallet === connector.id ? 'border-[#a58af8] bg-[#1f1b2d]' : 'border-[#a58af8]/30'
                      } rounded-lg sm:rounded-xl transition-colors relative`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img
                          src={getWalletIcon(connector)}
                          alt={connector.name}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = WALLET_ICONS.default
                          }}
                        />
                        <span className="text-sm sm:text-base text-white font-medium">
                          {connector.name}
                        </span>
                      </div>
                      {isPending && selectedWallet === connector.id && (
                        <Loader2 className="w-4 h-4 text-[#a58af8] animate-spin ml-auto" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-white/50">
                    By connecting your wallet, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
} 
