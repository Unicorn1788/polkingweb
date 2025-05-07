"use client"

import { useState, useEffect } from "react"
import { useAccount, useBalance } from "wagmi"
import { formatEther, Address } from "viem"
import {
  getStakingPlan,
  getPlanRate,
  getUserStakingAmount,
  stakePOL,
  getActiveStakesCount,
  claimRewards,
  getRewardsData,
} from "@/lib/wagmi-config"
import { useToast } from "@/context/toast-context"

export interface StakingPlan {
  id: number
  planRange: string
  duration: string
  maxRewards: string
  bestFor: string
  minAmount: number
  maxAmount: number
}

// Plans configuration
const PLANS: StakingPlan[] = [
  {
    id: 1,
    planRange: "1 - 999 POL",
    duration: "200 Days",
    maxRewards: "300%",
    bestFor: "New Stakers",
    minAmount: 1,
    maxAmount: 999,
  },
  {
    id: 2,
    planRange: "1000 - 2999 POL",
    duration: "150 Days",
    maxRewards: "300%",
    bestFor: "Medium Stakers",
    minAmount: 1000,
    maxAmount: 2999,
  },
  {
    id: 3,
    planRange: "3000 - 100000 POL",
    duration: "100 Days",
    maxRewards: "300%",
    bestFor: "Large Stakers",
    minAmount: 3000,
    maxAmount: 100000,
  },
]

export function useStaking(tokenAddress: Address) {
  const { address, isConnected } = useAccount()
  const { showToast } = useToast()
  
  // States
  const [balance, setBalance] = useState(0)
  const [nativeBalance, setNativeBalance] = useState(0)
  const [activeStakes, setActiveStakes] = useState(0)
  const [isStaking, setIsStaking] = useState(false)
  const [stakingAmount, setStakingAmount] = useState(0)
  const [currentPlan, setCurrentPlan] = useState<StakingPlan>(PLANS[0])
  const [rewards, setRewards] = useState({ totalUnclaimed: 0, rewardsPerSecond: 0 })
  
  // Get token balance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: tokenAddress,
  })
  
  // Get native MATIC balance
  const { data: nativeBalanceData } = useBalance({
    address,
  })
  
  // Update balance when data changes
  useEffect(() => {
    if (balanceData) {
      setBalance(Number(formatEther(balanceData.value)))
    }
  }, [balanceData])
  
  // Update native balance when data changes
  useEffect(() => {
    if (nativeBalanceData) {
      setNativeBalance(Number(formatEther(nativeBalanceData.value)))
    }
  }, [nativeBalanceData])
  
  // Get referrer from URL if available
  const [referrerAddress, setReferrerAddress] = useState<Address>("0x0000000000000000000000000000000000000000" as Address)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const ref = urlParams.get('ref')
      if (ref && ref.startsWith('0x')) {
        setReferrerAddress(ref as Address)
      }
    }
  }, [])
  
  // Auto-detect plan based on amount
  useEffect(() => {
    const plan = PLANS.find(
      plan => stakingAmount >= plan.minAmount && stakingAmount <= plan.maxAmount
    ) || PLANS[0]
    setCurrentPlan(plan)
  }, [stakingAmount])
  
  // Fetch active stakes and rewards data
  const fetchStakingData = async () => {
    if (isConnected && address) {
      try {
        const [stakesCount, rewardsData] = await Promise.all([
          getActiveStakesCount(address),
          getRewardsData(address)
        ])
        
        setActiveStakes(stakesCount)
        setRewards(rewardsData)
      } catch (error) {
        console.error("Error fetching staking data:", error)
      }
    }
  }
  
  useEffect(() => {
    fetchStakingData()
    // Set up an interval to refresh data every 30 seconds
    const interval = setInterval(fetchStakingData, 30000)
    return () => clearInterval(interval)
  }, [isConnected, address])
  
  // Stake function
  const stake = async () => {
    if (stakingAmount <= 0 || stakingAmount > balance || !isConnected) {
      showToast({
        type: "error",
        title: "Invalid Stake",
        message: stakingAmount <= 0 
          ? "Please enter an amount to stake" 
          : "Insufficient balance for staking"
      })
      return
    }
    
    try {
      setIsStaking(true)
      
      // Call the contract to stake
      const tx = await stakePOL(stakingAmount, referrerAddress)
      
      // Show success message
      showToast({
        type: "success",
        title: "Staking Successful",
        message: `Successfully staked ${stakingAmount} POL!`
      })
      
      // Refresh data
      await refetchBalance()
      await fetchStakingData()
      
      // Reset stake amount
      setStakingAmount(0)
    } catch (error) {
      console.error("Staking error:", error)
      showToast({
        type: "error",
        title: "Staking Failed",
        message: "There was an error while staking. Please try again."
      })
    } finally {
      setIsStaking(false)
    }
  }
  
  // Utility function to get current plan
  const getCurrentPlan = (amount: number): StakingPlan => {
    return PLANS.find(
      plan => amount >= plan.minAmount && amount <= plan.maxAmount
    ) || PLANS[0]
  }
  
  return {
    // State
    balance,
    nativeBalance,
    activeStakes,
    isStaking,
    stakingAmount,
    setStakingAmount,
    currentPlan,
    rewards,
    referrerAddress,
    
    // Actions
    stake,
    refreshData: fetchStakingData,
    
    // Helpers
    getCurrentPlan,
    plans: PLANS,
    isWalletConnected: isConnected
  }
} 
