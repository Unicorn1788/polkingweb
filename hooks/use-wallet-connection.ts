"use client"

import { useState, useCallback } from "react"
import { useAccount, useConnect, type Connector } from "wagmi"
import { trackWalletConnection } from "@/utils/analytics-utils"

export function useWalletConnection() {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { isConnected } = useAccount()
  const { connect: wagmiConnect } = useConnect()

  const connect = useCallback(
    async (connector: Connector) => {
      setIsConnecting(true)
      setError(null)

      try {
        // In a real implementation, this would use the wallet connection logic
        // For now, we'll just return a promise that resolves immediately
        const result = await wagmiConnect({ connector })

        // Track successful connection
        trackWalletConnection(connector.name || "unknown", true)

        return { success: true }
      } catch (err) {
        // Track failed connection
        trackWalletConnection(connector.name || "unknown", false)

        console.error("Error connecting wallet:", err)
        setError(err instanceof Error ? err : new Error("Failed to connect wallet"))
        return { success: false }
      } finally {
        setIsConnecting(false)
      }
    },
    [wagmiConnect],
  )

  return {
    connect,
    isConnecting,
    isConnected,
    error,
  }
}
