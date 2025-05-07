"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { WalletErrorType } from "@/components/ui/wallet-error"
import { useToast } from "./toast-context"
import { useAccount, useDisconnect, useConnect } from "wagmi"
import { logError, parseWalletError, ErrorSeverity, type LoggedError } from "@/utils/error-logger"
import { logger } from "@/lib/logger"

// Define types
type WalletError = {
  type: 'connection' | 'disconnection' | 'network' | 'transaction'
  message: string
  errorId?: string
  details?: string
}

type WalletContextType = {
  isWalletModalOpen: boolean
  openWalletModal: (callbackAction?: () => void) => void
  closeWalletModal: () => void
  pendingAction: (() => void) | null
  clearPendingAction: () => void
  address: string | undefined
  isConnected: boolean
  isConnecting: boolean
  isDisconnecting: boolean
  connect: () => void
  disconnect: () => void
  chainId: number | undefined
  error: WalletError | null
  clearError: () => void
  retryConnection: () => void
  isPersistenceEnabled: boolean
  togglePersistence: () => void
  recentErrors: LoggedError[]
  clearRecentErrors: () => void
  lastConnectedWallet: string | null
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Local storage keys
const PERSISTENCE_ENABLED_KEY = "polking:wallet-persistence-enabled"
const LAST_CONNECTED_WALLET_KEY = "polking:last-connected-wallet"
const CONNECTION_ATTEMPTS_KEY = "polking:connection-attempts"
const CONNECTION_SUCCESSES_KEY = "polking:connection-successes"

export function WalletProvider({ children }: { children: ReactNode }) {
  // State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [error, setError] = useState<WalletError | null>(null)
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(false)
  const [recentErrors, setRecentErrors] = useState<LoggedError[]>([])
  const [lastConnectedWallet, setLastConnectedWallet] = useState<string | null>(null)
  const { showToast } = useToast()

  // Wagmi hooks
  const { address, isConnected, isConnecting, chainId } = useAccount()
  const { disconnect: wagmiDisconnect, isPending: isDisconnecting } = useDisconnect()
  const { connectors } = useConnect()

  // Initialize persistence and last connected wallet from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const persistenceEnabled = localStorage.getItem(PERSISTENCE_ENABLED_KEY) === "true"
      const lastWallet = localStorage.getItem(LAST_CONNECTED_WALLET_KEY)
      setIsPersistenceEnabled(persistenceEnabled)
      setLastConnectedWallet(lastWallet)
    }
  }, [])

  // Save last connected wallet
  useEffect(() => {
    if (isConnected && typeof window !== "undefined") {
      const currentWallet = connectors.find(c => c.ready)?.name || null
      if (currentWallet) {
        localStorage.setItem(LAST_CONNECTED_WALLET_KEY, currentWallet)
        setLastConnectedWallet(currentWallet)
      }
    }
  }, [isConnected, connectors])

  // Open wallet modal
  const openWalletModal = useCallback((callbackAction?: () => void) => {
    setIsWalletModalOpen(true)
    if (callbackAction) {
      setPendingAction(() => callbackAction)
    }
  }, [])

  // Close wallet modal
  const closeWalletModal = useCallback(() => {
    setIsWalletModalOpen(false)
    setPendingAction(null)
  }, [])

  // Clear pending action
  const clearPendingAction = useCallback(() => {
    setPendingAction(null)
  }, [])

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      openWalletModal()
    } catch (err) {
      const parsedError = parseWalletError(err)
      const walletError: WalletError = {
        type: 'connection',
        message: parsedError.message,
        errorId: crypto.randomUUID(),
      }
      setError(walletError)
      logger.error("Wallet connection error:", err)
    }
  }, [openWalletModal])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await wagmiDisconnect()
      if (typeof window !== "undefined") {
        localStorage.removeItem(LAST_CONNECTED_WALLET_KEY)
      }
      setLastConnectedWallet(null)
      showToast({
        type: "info",
        title: "Wallet Disconnected",
        message: "Your wallet has been disconnected",
        duration: 3000,
      })
    } catch (err) {
      const parsedError = parseWalletError(err)
      const walletError: WalletError = {
        type: 'disconnection',
        message: parsedError.message,
        errorId: crypto.randomUUID(),
      }
      setError(walletError)
      logger.error("Wallet disconnection error:", err)
    }
  }, [wagmiDisconnect, showToast])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Retry connection
  const retryConnection = useCallback(() => {
    clearError()
    connect()
  }, [clearError, connect])

  // Toggle persistence
  const togglePersistence = useCallback(() => {
    const newValue = !isPersistenceEnabled
    setIsPersistenceEnabled(newValue)
    if (typeof window !== "undefined") {
      localStorage.setItem(PERSISTENCE_ENABLED_KEY, newValue.toString())
    }
  }, [isPersistenceEnabled])

  // Clear recent errors
  const clearRecentErrors = useCallback(() => {
    setRecentErrors([])
  }, [])

  const value = {
    isWalletModalOpen,
    openWalletModal,
    closeWalletModal,
    pendingAction,
    clearPendingAction,
    address,
    isConnected,
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
    chainId,
    error,
    clearError,
    retryConnection,
    isPersistenceEnabled,
    togglePersistence,
    recentErrors,
    clearRecentErrors,
    lastConnectedWallet,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
