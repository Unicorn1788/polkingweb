import { Address, parseEther } from "viem"
import { createConfig, http } from "wagmi"
import { polygon } from "wagmi/chains"
import { readContract, writeContract } from "@wagmi/core"
import { injected, walletConnect } from "wagmi/connectors"
import POLKING from "@/app/contracts/POLKING.json"
import { logger } from "./logger"

export const POLKING_ADDRESS = "0x33041aaB2d4E13881Dc4AF8e0E0001E25666503A" as Address

// Get WalletConnect project ID from environment variable
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

// Define custom window type for Phantom
declare global {
  interface Window {
    phantom?: {
      ethereum?: any
    }
  }
}

// Create wagmi config with retry logic
export const config = createConfig({
  chains: [polygon],
  connectors: [
    // MetaMask
    injected({
      target: "metaMask",
      shimDisconnect: true,
    }),
    // WalletConnect
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: "Polking Finance",
        description: "Stake like a king. Rise through the ranks. Reign with rewards.",
        url: "https://polking.io",
        icons: ["https://polking.io/images/polking-logo.png"],
      },
    }),
    // TokenPocket
    injected({
      target: "tokenPocket",
      shimDisconnect: true,
    }),
    // Phantom
    injected({
      target: "phantom",
      shimDisconnect: true,
    }),
  ],
  transports: {
    [polygon.id]: http("https://polygon-rpc.com", {
      retryCount: 3,
      retryDelay: 1000,
    }),
  },
})

// Export contract config with proper types
export const contractConfig = {
  address: POLKING_ADDRESS,
  abi: POLKING.abi,
} as const

// Export contract write config
export const contractWriteConfig = {
  ...contractConfig,
  functionName: "stake",
} as const

export type ContractConfig = typeof contractConfig
export type ContractWriteConfig = typeof contractWriteConfig

// Initialize wagmi client
export const initializeWagmi = () => {
  return config
}

// Utility function to get staking plan details with retry
export async function getStakingPlan(amount: number) {
  if (!amount) return null
  
  let retries = 3
  while (retries > 0) {
    try {
      const plan = await readContract(config, {
        abi: POLKING.abi,
        address: POLKING_ADDRESS,
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

// Get plan details (rate and duration)
export async function getPlanRate(plan: number) {
  try {
    const result = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS,
      functionName: "getRate",
      args: [plan],
    })
    
    // Type the result as we know the ABI structure
    const typedResult = result as [bigint, bigint]
    
    return {
      roiBps: Number(typedResult[0]), // ROI in basis points
      durationDays: Number(typedResult[1]), // Duration in days
    }
  } catch (error) {
    logger.error("Error getting plan rate:", error)
    return { roiBps: 0, durationDays: 0 }
  }
}

// Get user's staking balance
export async function getUserStakingAmount(address: Address) {
  try {
    const amount = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS,
      functionName: "getStakeAmount",
      args: [address],
    })
    
    return Number(amount)
  } catch (error) {
    logger.error("Error getting user stake amount:", error)
    return 0
  }
}

// Stake POL tokens with a referrer
export async function stakePOL(amount: number, referrer: Address) {
  try {
    const tx = await writeContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS,
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

// Get active stakes count
export async function getActiveStakesCount(address: Address) {
  try {
    const count = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS,
      functionName: "activeStakesCount",
      args: [address],
    })
    
    return Number(count)
  } catch (error) {
    logger.error("Error getting active stakes count:", error)
    return 0
  }
}

// Claim rewards
export async function claimRewards() {
  try {
    const tx = await writeContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS,
      functionName: "claim",
    })
    
    return tx
  } catch (error) {
    logger.error("Error claiming rewards:", error)
    throw error
  }
}

// Get rewards data
export async function getRewardsData(address: Address) {
  try {
    const data = await readContract(config, {
      abi: POLKING.abi,
      address: POLKING_ADDRESS,
      functionName: "getLiveRewardsData",
      args: [address],
    })
    
    // Type the result as we know the ABI structure
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

export default config
