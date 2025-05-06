import { formatUnits, parseUnits } from "viem"

// Gas price units
export type GasUnit = "gwei" | "wei" | "ether"

// Gas price data
export interface GasPrice {
  slow: bigint
  average: bigint
  fast: bigint
  baseFee?: bigint
  unit: GasUnit
}

// Gas estimation result
export interface GasEstimation {
  gasLimit: bigint
  gasPriceWei: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
  estimatedCostWei: bigint
  estimatedCostEther: string
  estimatedTimeMinutes: number
  speed: "slow" | "average" | "fast"
}

/**
 * Format gas price to human-readable string
 */
export function formatGasPrice(gasPrice: bigint, unit: GasUnit = "gwei"): string {
  return formatUnits(gasPrice, unit === "gwei" ? 9 : unit === "ether" ? 18 : 0)
}

/**
 * Format gas cost to human-readable string with currency
 */
export function formatGasCost(weiAmount: bigint, currency = "MATIC"): string {
  const etherAmount = formatUnits(weiAmount, 18)
  // Format to max 6 decimal places
  const formattedAmount = Number.parseFloat(etherAmount)
    .toFixed(6)
    .replace(/\.?0+$/, "")
  return `${formattedAmount} ${currency}`
}

/**
 * Get estimated confirmation time based on gas price
 */
export function getEstimatedTime(speed: "slow" | "average" | "fast"): number {
  // Return estimated time in minutes
  switch (speed) {
    case "slow":
      return 5
    case "average":
      return 2
    case "fast":
      return 0.5
    default:
      return 2
  }
}

/**
 * Calculate the estimated cost of a transaction
 */
export function calculateGasCost(gasLimit: bigint, gasPrice: bigint): bigint {
  return gasLimit * gasPrice
}

/**
 * Get a user-friendly message for the estimated time
 */
export function getTimeMessage(minutes: number): string {
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60)
    return `~${seconds} seconds`
  }
  return `~${Math.round(minutes)} minutes`
}

/**
 * Mock function to get current gas prices
 * In a real app, you would fetch this from an API like Etherscan, Infura, or Alchemy
 */
export async function getGasPrices(chainId = 137): Promise<GasPrice> {
  // For Polygon (chainId 137)
  if (chainId === 137) {
    // These are placeholder values - in a real app, fetch from an API
    const baseFee = parseUnits("50", 9) // 50 gwei

    return {
      slow: parseUnits("60", 9), // 60 gwei
      average: parseUnits("80", 9), // 80 gwei
      fast: parseUnits("100", 9), // 100 gwei
      baseFee,
      unit: "gwei",
    }
  }

  // Default fallback
  return {
    slow: parseUnits("20", 9), // 20 gwei
    average: parseUnits("40", 9), // 40 gwei
    fast: parseUnits("60", 9), // 60 gwei
    unit: "gwei",
  }
}
