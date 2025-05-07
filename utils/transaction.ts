/**
 * @file transaction.ts
 * @description Transaction utilities for blockchain interactions
 * 
 * This file contains utilities for handling blockchain transactions,
 * including URL generation for explorers and transaction status tracking.
 * 
 * IMPORTANT: When updating network configuration:
 * 1. Update POLYGON_EXPLORER_URL if the network changes
 * 2. Update any related network constants in wagmi-config.ts
 */

import type { Hash, TransactionReceipt } from "viem"

const POLYGON_EXPLORER_URL = "https://polygonscan.com"

export type TransactionStatus = "pending" | "success" | "error" | "cancelled"

export interface TransactionDetails {
  hash: Hash
  description: string
  status: TransactionStatus
  receipt?: TransactionReceipt
  error?: Error
  timestamp: number
  gasEstimate?: bigint // Added gas estimate
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: Hash): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

/**
 * Get explorer URL for a transaction
 */
export function getExplorerTxUrl(hash: Hash): string {
  return `${POLYGON_EXPLORER_URL}/tx/${hash}`
}

/**
 * Get a user-friendly message based on transaction status
 */
export function getTransactionStatusMessage(status: TransactionStatus): string {
  switch (status) {
    case "pending":
      return "Your transaction is being processed"
    case "success":
      return "Transaction confirmed successfully"
    case "error":
      return "Transaction failed"
    case "cancelled":
      return "Transaction was cancelled"
    default:
      return "Unknown transaction status"
  }
}

/**
 * Get estimated confirmation time based on current network conditions
 * This is a placeholder - in a real app, you might want to get this from a gas API
 */
export function getEstimatedConfirmationTime(): string {
  // For now, just return a static estimate
  return "~30 seconds"
}

/**
 * Parse error message from transaction error
 */
export function parseTransactionError(error: any): string {
  // Handle common error types
  if (typeof error === "string") return error

  if (error?.message) {
    // Extract the most relevant part of the error message
    const message = error.message

    if (message.includes("user rejected")) {
      return "Transaction was rejected"
    }

    if (message.includes("insufficient funds")) {
      return "Insufficient funds for transaction"
    }

    if (message.includes("gas required exceeds allowance")) {
      return "Gas required exceeds allowance"
    }

    // Return the error message, truncated if too long
    return message.length > 100 ? `${message.substring(0, 100)}...` : message
  }

  return "Unknown error occurred"
}

/**
 * Get transaction URL for PolygonScan
 * @param {string} hash - Transaction hash
 * @returns {string} Full URL to transaction on PolygonScan
 */
export function getTransactionUrl(hash: string): string {
  return `${POLYGON_EXPLORER_URL}/tx/${hash}`
}

/**
 * Get address URL for PolygonScan
 * @param {string} address - Wallet or contract address
 * @returns {string} Full URL to address on PolygonScan
 */
export function getAddressUrl(address: string): string {
  return `${POLYGON_EXPLORER_URL}/address/${address}`
}

/**
 * Get token URL for PolygonScan
 * @param {string} address - Token contract address
 * @returns {string} Full URL to token on PolygonScan
 */
export function getTokenUrl(address: string): string {
  return `${POLYGON_EXPLORER_URL}/token/${address}`
}

/**
 * Get block URL for PolygonScan
 * @param {number} blockNumber - Block number
 * @returns {string} Full URL to block on PolygonScan
 */
export function getBlockUrl(blockNumber: number): string {
  return `${POLYGON_EXPLORER_URL}/block/${blockNumber}`
}

/**
 * Get transaction status from receipt
 * @param {TransactionReceipt} receipt - Transaction receipt
 * @returns {TransactionStatus} Status of the transaction
 */
export function getTransactionStatus(receipt: TransactionReceipt): TransactionStatus {
  if (receipt.status === "success") return "success"
  if (receipt.status === "reverted") return "error"
  return "pending"
}

/**
 * Get error message from transaction error
 * @param {unknown} error - Transaction error
 * @returns {string} Human-readable error message
 */
export function getTransactionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return "Unknown error occurred"
}
