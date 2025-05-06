"use client"

import { useEffect, useRef } from "react"
import { useStakingNotifications } from "@/services/staking-notification-service"
import { useWallet } from "@/context/wallet-context"
import { toast } from "sonner"

// Mock contract events for demonstration
const MOCK_EVENTS = {
  CONTRACT_COMPLETION_CHECK_INTERVAL: 60000, // 1 minute
  CAPACITY_CHECK_INTERVAL: 300000, // 5 minutes
  REWARDS_CHECK_INTERVAL: 120000, // 2 minutes
}

interface StakingNotificationListenerProps {
  onContractComplete?: (contractId: string) => void
}

const StakingNotificationListener = ({ onContractComplete }: StakingNotificationListenerProps) => {
  const { notifyContractCompletion, notifyCapacityWarning, notifyRewardsAvailable } = useStakingNotifications()
  const { isConnected, address } = useWallet()
  const lastNotificationTime = useRef<Record<string, number>>({})

  // Refs for intervals
  const contractCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const capacityCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const rewardsCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mock data for demonstration
  const mockContracts = [
    { id: "contract-001", tier: "Tier 1", completed: false, percentageFilled: 85 },
    { id: "contract-002", tier: "Tier 2", completed: false, percentageFilled: 92 },
    { id: "contract-003", tier: "Tier 3", completed: false, percentageFilled: 78 },
  ]

  useEffect(() => {
    if (!address) return

    const checkContractCompletions = () => {
      const now = Date.now()
      const contracts = JSON.parse(localStorage.getItem("staking_contracts") || "{}")
      const userContracts = contracts[address] || []

      userContracts.forEach((contract: any) => {
        const contractId = contract.id
        const lastNotified = lastNotificationTime.current[contractId] || 0

        // Check if contract is completed and hasn't been notified in the last 5 minutes
        if (contract.completed && now - lastNotified > 5 * 60 * 1000) {
          // Update last notification time
          lastNotificationTime.current[contractId] = now

          // Show toast notification
          toast.success("Staking contract completed!", {
            description: `Your ${contract.amount} POL staking contract has completed.`,
            duration: 5000,
          })

          // Call the callback if provided
          if (onContractComplete) {
            onContractComplete(contractId)
          }
        }
      })
    }

    // Check immediately and then every minute
    checkContractCompletions()
    const interval = setInterval(checkContractCompletions, 60 * 1000)

    return () => clearInterval(interval)
  }, [address, onContractComplete])

  // Check for capacity warnings
  useEffect(() => {
    if (!isConnected) return

    // Function to check capacity warnings
    const checkCapacityWarnings = async () => {
      try {
        // In a real implementation, this would call the blockchain
        // For demo purposes, we'll check our mock contracts
        const highCapacityContracts = mockContracts.filter((c) => c.percentageFilled > 90)

        if (highCapacityContracts.length > 0) {
          const contract = highCapacityContracts[0]
          notifyCapacityWarning({
            tier: contract.tier,
            percentageFilled: contract.percentageFilled,
          })
        }
      } catch (error) {
        console.error("Error checking capacity warnings:", error)
      }
    }

    // Set up interval
    capacityCheckIntervalRef.current = setInterval(checkCapacityWarnings, MOCK_EVENTS.CAPACITY_CHECK_INTERVAL)

    // Clean up
    return () => {
      if (capacityCheckIntervalRef.current) {
        clearInterval(capacityCheckIntervalRef.current)
      }
    }
  }, [isConnected, notifyCapacityWarning])

  // Check for available rewards
  useEffect(() => {
    if (!isConnected || !address) return

    // Function to check available rewards
    const checkAvailableRewards = async () => {
      try {
        // In a real implementation, this would call the blockchain
        // For demo purposes, we'll randomly generate rewards
        if (Math.random() > 0.7) {
          const randomReward = Math.floor(Math.random() * 1000) + 100
          notifyRewardsAvailable({
            amount: randomReward,
          })
        }
      } catch (error) {
        console.error("Error checking available rewards:", error)
      }
    }

    // Set up interval
    rewardsCheckIntervalRef.current = setInterval(checkAvailableRewards, MOCK_EVENTS.REWARDS_CHECK_INTERVAL)

    // Clean up
    return () => {
      if (rewardsCheckIntervalRef.current) {
        clearInterval(rewardsCheckIntervalRef.current)
      }
    }
  }, [isConnected, address, notifyRewardsAvailable])

  // This component doesn't render anything
  return null
}

export default StakingNotificationListener
