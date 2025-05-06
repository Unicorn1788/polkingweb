"use client"

import { useState, useCallback } from "react"
import { useTransaction } from "@/context/transaction-context"
import type { Hash } from "viem"
import type { GasEstimation } from "@/utils/gas"

interface TransactionOptions {
  description: string
  gasEstimation?: GasEstimation
}

interface TransactionState {
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  error: Error | null
  hash: Hash | null
}

/**
 * Hook for handling transactions with automatic notifications
 */
export function useTransactionNotification() {
  const { addTransaction } = useTransaction()
  const [state, setState] = useState<TransactionState>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    hash: null,
  })

  /**
   * Execute a transaction function with automatic notifications
   */
  const sendTransaction = useCallback(
    async (transactionFn: () => Promise<Hash | undefined>, options: TransactionOptions): Promise<Hash | undefined> => {
      setState({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        hash: null,
      })

      try {
        const hash = await transactionFn()

        if (hash) {
          // Add transaction to be tracked with gas estimate if available
          addTransaction(hash, options.description, options.gasEstimation?.estimatedCostWei)

          setState({
            isLoading: false,
            isSuccess: true,
            isError: false,
            error: null,
            hash,
          })

          return hash
        } else {
          // Transaction function didn't return a hash
          setState({
            isLoading: false,
            isSuccess: false,
            isError: true,
            error: new Error("Transaction failed - no hash returned"),
            hash: null,
          })

          return undefined
        }
      } catch (error) {
        setState({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error: error as Error,
          hash: null,
        })

        return undefined
      }
    },
    [addTransaction],
  )

  return {
    ...state,
    sendTransaction,
  }
}
