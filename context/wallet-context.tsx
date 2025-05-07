"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { useToast } from "./toast-context"
import { useAccount, useDisconnect, useConnect } from "wagmi"
import { logError, parseWalletError, ErrorSeverity, type LoggedError } from "@/utils/error-logger"
import { logger } from "@/lib/logger"
import { polygon } from "viem/chains"

// Define types
type WalletError = {
  type: 'connection' | 'disconnection' | 'network' | 'transaction'
  message: string
  errorId: string
  details?: string
  timestamp: number
}

// Toast event types for debouncing
const TOAST_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error'
};

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
  handleWalletConnect: (connectorId: string) => Promise<void>
  selectedWallet: string | null
  connectionSuccess: boolean
  isPending: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Local storage keys
const PERSISTENCE_ENABLED_KEY = "polking:wallet-persistence-enabled"
const LAST_CONNECTED_WALLET_KEY = "polking:last-connected-wallet"

export function WalletProvider({ children }: { children: ReactNode }) {
  // State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [error, setError] = useState<WalletError | null>(null)
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(false)
  const [recentErrors, setRecentErrors] = useState<LoggedError[]>([])
  const [lastConnectedWallet, setLastConnectedWallet] = useState<string | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [connectionSuccess, setConnectionSuccess] = useState(false)
  
  // Toast debouncing state
  const [lastToastEvent, setLastToastEvent] = useState<string | null>(null)
  const [lastToastTime, setLastToastTime] = useState(0)
  
  const { showToast } = useToast()

  // Wagmi hooks
  const { address, isConnected, isConnecting, chainId } = useAccount()
  const { disconnect: wagmiDisconnect, isPending: isDisconnecting } = useDisconnect()
  const { connectors, connectAsync, isPending } = useConnect()

  // Function to show toast with debouncing
  const showEventToast = useCallback((event: string, options: { 
    type: "success" | "error" | "warning" | "info"; 
    title: string; 
    message: string;
    duration?: number
  }) => {
    const now = Date.now();
    
    // Prevent showing toast for same event within 1.5 seconds
    if (lastToastEvent === event && now - lastToastTime < 1500) {
      return;
    }
    
    setLastToastEvent(event);
    setLastToastTime(now);
    showToast(options);
  }, [showToast, lastToastEvent, lastToastTime]);

  // Open wallet modal
  const openWalletModal = useCallback((callbackAction?: () => void) => {
    setIsWalletModalOpen(true)
    if (callbackAction) {
      setPendingAction(() => callbackAction)
    }
  }, [])

  // Close wallet modal
  const closeWalletModal = useCallback(() => {
    // Don't trigger unnecessary state updates if modal is already closed
    if (!isWalletModalOpen) return;
    
    setIsWalletModalOpen(false)
    setPendingAction(null)
    
    // Reset any error or connection states
    setError(null)
    setConnectionSuccess(false)
    setSelectedWallet(null)
  }, [isWalletModalOpen])

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

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isWalletModalOpen) {
      setError(null)
      setConnectionSuccess(false)
      setSelectedWallet(null)
    }
  }, [isWalletModalOpen])

  // Reset debounce state when connection status changes
  useEffect(() => {
    // Reset the toast event when connection status changes
    setLastToastEvent(null);
  }, [isConnected]);

  // Close modal when connected
  useEffect(() => {
    if (isConnected && isWalletModalOpen) {
      // Add a small delay to allow any animation to complete
      const timer = setTimeout(() => {
        closeWalletModal();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isConnected, isWalletModalOpen, closeWalletModal]);

  // Clear pending action
  const clearPendingAction = useCallback(() => {
    setPendingAction(null)
  }, [])

  // Handle wallet connection
  const handleWalletConnect = useCallback(async (connectorId: string) => {
    try {
      setSelectedWallet(connectorId)
      setError(null)

      // If already connected, just show success
      if (isConnected) {
        setConnectionSuccess(true)
        return
      }

      const connector = connectors.find(c => c.id === connectorId)
      if (!connector) {
        throw new Error("Wallet connector not found")
      }

      // Special handling for different wallet types
      if (connectorId === 'phantom') {
        if (typeof window !== 'undefined' && !window.phantom?.ethereum) {
          window.open('https://phantom.app/download', '_blank')
          throw new Error('Please install Phantom wallet first')
        }
      }

      if (connectorId === 'tokenPocket') {
        const hasTokenPocket = typeof window !== 'undefined' && 
          (window.tokenpocket?.ethereum || 
           (window.ethereum?.isTokenPocket) || 
           (window.ethereum?.providers?.some((p: any) => p.isTokenPocket)))
           
        if (!hasTokenPocket) {
          window.open('https://www.tokenpocket.pro/en/download/app', '_blank')
          throw new Error('Please install TokenPocket wallet first')
        }
      }

      if (connectorId === 'coinbaseWallet') {
        const hasCoinbaseWallet = typeof window !== 'undefined' && 
          (window.coinbaseWalletExtension || 
           (window.ethereum?.isCoinbaseWallet) || 
           (window.ethereum?.providers?.some((p: any) => p.isCoinbaseWallet)))
           
        if (!hasCoinbaseWallet) {
          window.open('https://www.coinbase.com/wallet/downloads', '_blank')
          throw new Error('Please install Coinbase Wallet first')
        }
      }

      // Connect to the wallet
      await connectAsync({
        connector,
        chainId: polygon.id,
      })

      // Show success toast after connection
      showEventToast(TOAST_EVENTS.CONNECT, {
        type: "success",
        title: "Wallet Connected",
        message: "Your wallet has been connected successfully"
      })

    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : "Failed to connect wallet. Please try again."
      
      const walletError: WalletError = {
        type: 'connection',
        message: errorMessage,
        errorId: crypto.randomUUID(),
        timestamp: Date.now()
      }
      setError(walletError)
      logger.error("Wallet connection error:", err)
      
      // Show error toast
      showEventToast(TOAST_EVENTS.ERROR, {
        type: "error",
        title: "Connection Failed",
        message: errorMessage
      })
    }
  }, [connectAsync, connectors, isConnected, showEventToast])

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
        timestamp: Date.now()
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
      
      // Show disconnection toast with debouncing
      showEventToast(TOAST_EVENTS.DISCONNECT, {
        type: "info",
        title: "Wallet Disconnected",
        message: "Your wallet has been disconnected"
      })
    } catch (err) {
      const parsedError = parseWalletError(err)
      const walletError: WalletError = {
        type: 'disconnection',
        message: parsedError.message,
        errorId: crypto.randomUUID(),
        timestamp: Date.now()
      }
      setError(walletError)
      logger.error("Wallet disconnection error:", err)
      
      // Show error toast with debouncing
      showEventToast(TOAST_EVENTS.ERROR, {
        type: "error",
        title: "Disconnection Error",
        message: parsedError.message
      })
    }
  }, [wagmiDisconnect, showEventToast])

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
    handleWalletConnect,
    selectedWallet,
    connectionSuccess,
    isPending,
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
