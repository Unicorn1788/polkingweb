/**
 * @file wagmi-config.ts
 * @description Core blockchain configuration and contract interactions
 * 
 * This file contains all blockchain-related configurations and contract interaction functions.
 * It uses Reown AppKit and Wagmi for wallet integration and contract interactions.
 * 
 * IMPORTANT: When updating contract addresses:
 * 1. Update NEXT_PUBLIC_POLKING_ADDRESS in .env
 * 2. The ABI in app/contracts/POLKING.json should remain the same
 * 3. Update any related contract addresses in other files
 */

import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon } from '@reown/appkit/networks'
import { readContract, writeContract } from "@wagmi/core"
import type { Address } from "viem"
import { parseEther } from "viem"
import POLKING from "@/app/contracts/POLKING.json"
import { logger } from "./logger"

// Get projectId from environment
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

if (!projectId) {
  throw new Error('Project ID is not defined')
}

/**
 * Contract Addresses
 * These addresses can be updated in the .env file
 * The ABI structure should remain constant
 */
export const POLKING_ADDRESS = process.env.NEXT_PUBLIC_POLKING_ADDRESS || ""
export const POLYGON_CHAIN_ID = 137 // Polygon Mainnet chain ID
export const APP_NAME = "POLKING"

// Export metadata separately for use in other files
export const metadata = {
  name: APP_NAME,
  description: "Stake like a king. Rise through the ranks. Reign with rewards.",
  url: "https://polking.io",
  icons: ["https://polking.io/images/polking-logo.png"],
}

/**
 * Wagmi Adapter Configuration
 * Handles wallet connection and network setup
 */
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: [polygon]
})

export const config = wagmiAdapter.wagmiConfig

/**
 * Contract Configuration
 * Type-safe contract configuration for read operations
 */
export const contractConfig = {
  address: POLKING_ADDRESS as `0x${string}`,
  abi: POLKING.abi,
} as const

/**
 * Contract Write Configuration
 * Type-safe contract configuration for write operations
 */
export const contractWriteConfig = {
  ...contractConfig,
  functionName: "stake",
} as const

export type ContractConfig = typeof contractConfig
export type ContractWriteConfig = typeof contractWriteConfig

/**
 * Initialize wagmi client
 * @returns {WagmiConfig} Configured wagmi client
 */
export const initializeWagmi = () => {
  return config
}

/**
 * Get staking plan details with retry mechanism
 * @param {number} amount - Amount to stake
 * @returns {Promise<number | null>} Plan number or null if failed
 */
export async function getStakingPlan(amount: number): Promise<number | null> {
  if (!amount) return null
  
  let retries = 3
  while (retries > 0) {
    try {
      const plan = await readContract(config, {
        abi: POLKING.abi,
        address: POLKING_ADDRESS as `0x${string}`,
        functionName: "getPlan",
        args: [parseEther(amount.toString())],
      })
      
      return Number(plan)
    } catch (error) {
      retries--
      if (retries === 0) {
        logger.error("Error getting plan after retries:", error)
        return null
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)))
    }
  }
  return null
}

/**
 * Get plan rate and duration
 * @param {number} plan - Plan number
 * @returns {Promise<{roiBps: number, durationDays: number}>} Plan details
 */
export async function getPlanRate(plan: number): Promise<{ roiBps: number; durationDays: number }> {
  try {
    const result = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS as `0x${string}`,
      functionName: "getRate",
      args: [plan],
    })
    
    const typedResult = result as [bigint, bigint]
    
    return {
      roiBps: Number(typedResult[0]),
      durationDays: Number(typedResult[1]),
    }
  } catch (error) {
    logger.error("Error getting plan rate:", error)
    return { roiBps: 0, durationDays: 0 }
  }
}

/**
 * Get user's staking balance
 * @param {Address} address - User's wallet address
 * @returns {Promise<number>} Staked amount
 */
export async function getUserStakingAmount(address: Address): Promise<number> {
  try {
    const amount = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS as `0x${string}`,
      functionName: "getStakeAmount",
      args: [address],
    })
    
    return Number(amount)
  } catch (error) {
    logger.error("Error getting user stake amount:", error)
    return 0
  }
}

/**
 * Stake POL tokens with a referrer
 * @param {number} amount - Amount to stake
 * @param {Address} referrer - Referrer's address
 * @returns {Promise<`0x${string}`>} Transaction hash
 */
export async function stakePOL(amount: number, referrer: Address): Promise<`0x${string}`> {
  try {
    const tx = await writeContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS as `0x${string}`,
      functionName: "stake",
      args: [referrer],
      value: parseEther(amount.toString()),
    })
    
    return tx
  } catch (error) {
    logger.error("Error staking:", error)
    throw error
  }
}

/**
 * Get active stakes count
 * @param {Address} address - User's wallet address
 * @returns {Promise<number>} Number of active stakes
 */
export async function getActiveStakesCount(address: Address): Promise<number> {
  try {
    const count = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS as `0x${string}`,
      functionName: "activeStakesCount",
      args: [address],
    })
    
    return Number(count)
  } catch (error) {
    logger.error("Error getting active stakes count:", error)
    return 0
  }
}

/**
 * Claim rewards
 * @returns {Promise<`0x${string}`>} Transaction hash
 */
export async function claimRewards(): Promise<`0x${string}`> {
  try {
    const tx = await writeContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS as `0x${string}`,
      functionName: "claim",
    })
    
    return tx
  } catch (error) {
    logger.error("Error claiming rewards:", error)
    throw error
  }
}

/**
 * Get rewards data
 * @param {Address} address - User's wallet address
 * @returns {Promise<{totalUnclaimed: number, rewardsPerSecond: number}>} Rewards data
 */
export async function getRewardsData(address: Address): Promise<{ totalUnclaimed: number; rewardsPerSecond: number }> {
  try {
    const data = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS as `0x${string}`,
      functionName: "getLiveRewardsData",
      args: [address],
    })
    
    const typedData = data as [bigint, bigint]
    
    return {
      totalUnclaimed: Number(typedData[0]),
      rewardsPerSecond: Number(typedData[1]),
    }
  } catch (error) {
    logger.error("Error getting rewards data:", error)
    return { totalUnclaimed: 0, rewardsPerSecond: 0 }
  }
}

/**
 * Get affiliate/downline info for a user
 * @param {Address} address - User's wallet address
 * @param {number} maxDepth - Maximum depth to fetch
 * @returns {Promise<{user: string, volume: number, activeStakeCount: number}[]>}
 */
export async function getDownlineBatchInfo(address: Address, maxDepth: number = 1): Promise<{user: string, volume: number, activeStakeCount: number}[]> {
  try {
    const data = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS as `0x${string}`,
      functionName: "getDownlineBatchInfo",
      args: [address, maxDepth],
    })
    // data is array of { user, volume, activeStakeCount }
    return (data as any[]).map((item) => ({
      user: item.user,
      volume: Number(item.volume),
      activeStakeCount: Number(item.activeStakeCount),
    }))
  } catch (error) {
    logger.error("Error getting downline batch info:", error)
    return []
  }
}

export default config
