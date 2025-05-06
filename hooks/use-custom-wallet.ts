"use client"

import { useState, useEffect, useCallback } from "react"
import { injectedConnector } from "@/lib/wallet-config"
import { polygon } from "wagmi/chains"

export function useCustomWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  // Initialize and check for existing connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connectedAccount = await injectedConnector.getAccount()
        setAccount(connectedAccount)

        // Check chain if connected
        if (connectedAccount && window.ethereum) {
          const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
          setChainId(Number.parseInt(chainIdHex, 16))
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err)
      }
    }

    checkConnection()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null)
      })

      window.ethereum.on("chainChanged", (chainIdHex: string) => {
        setChainId(Number.parseInt(chainIdHex, 16))
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {})
        window.ethereum.removeListener("chainChanged", () => {})
      }
    }
  }, [])

  // Connect wallet
  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const result = await injectedConnector.connect()
      setAccount(result.account)

      // Check chain after connection
      if (window.ethereum) {
        const chainIdHex = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(Number.parseInt(chainIdHex, 16))
      }

      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to connect wallet"))
      throw err
    } finally {
      setIsConnecting(false)
    }
  }, [])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await injectedConnector.disconnect()
      setAccount(null)
      return true
    } catch (err) {
      console.error("Error disconnecting wallet:", err)
      return false
    }
  }, [])

  // Switch network
  const switchNetwork = useCallback(
    async (targetChainId: number = polygon.id) => {
      if (!account) return false

      try {
        const success = await injectedConnector.switchChain(targetChainId)
        if (success) {
          setChainId(targetChainId)
        }
        return success
      } catch (err) {
        console.error("Error switching network:", err)
        return false
      }
    },
    [account],
  )

  return {
    account,
    isConnected: !!account,
    isConnecting,
    error,
    chainId,
    connect,
    disconnect,
    switchNetwork,
    isOnCorrectNetwork: chainId === polygon.id,
  }
}
