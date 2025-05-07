import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { logger } from "./logger"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number with spaces for thousands
export function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null || isNaN(Number(num))) return '0'
  return Math.floor(Number(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Handle contract errors with proper logging
export function handleContractError(error: unknown, context: string): void {
  if (error instanceof Error) {
    logger.error(`${context}: ${error.message}`)
  } else {
    logger.error(`${context}: Unknown error occurred`)
  }
}

// Format token amount with proper decimals
export function formatTokenAmount(amount: bigint | number, decimals: number = 18): string {
  const num = typeof amount === 'bigint' ? Number(amount) / 10 ** decimals : amount
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  })
}
