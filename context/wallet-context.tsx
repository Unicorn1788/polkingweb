"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { WalletErrorType } from "@/components/ui/wallet-error"
import { useToast } from "./toast-context"
import { useAccount, useDisconnect } from "wagmi"
import { logError, parseWalletError, ErrorSeverity, type LoggedError } from "@/utils/error-logger"

// Define types
type WalletError = {
  type: WalletErrorType
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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Local storage keys
const PERSISTENCE_ENABLED_KEY = "polking:wallet-persistence-enabled"
const CONNECTION_ATTEMPTS_KEY = "polking:connection-attempts"
const CONNECTION_SUCCESSES_KEY = "polking:connection-successes"

export function WalletProvider({ children }: { children: ReactNode }) {
  // State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [error, setError] = useState<WalletError | null>(null)
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(false)
  const [recentErrors, setRecentErrors] = useState<LoggedError[]>([])
  const { showToast } = useToast()

  // Wagmi hooks
  const { address, isConnected, isConnecting, chainId } = useAccount()
  const { disconnect: wagmiDisconnect, isPending: isDisconnecting } = useDisconnect()

  // Initialize persistence setting from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const persistenceEnabled = localStorage.getItem(PERSISTENCE_ENABLED_KEY) === "true"
      setIsPersistenceEnabled(persistenceEnabled)
    }
  }, [])

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
      setError(parsedError)
      logError(parsedError, ErrorSeverity.ERROR)
    }
  }, [openWalletModal])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await wagmiDisconnect()
      showToast({
        type: "info",
        title: "Wallet Disconnected",
        message: "Your wallet has been disconnected",
        duration: 3000,
      })
    } catch (err) {
      const parsedError = parseWalletError(err)
      setError(parsedError)
      logError(parsedError, ErrorSeverity.ERROR)
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
