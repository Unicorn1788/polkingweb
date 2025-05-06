"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Clock, TrendingUp, Users, Shield, Wallet } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAccount, useBalance, useWriteContract, useTransaction } from "wagmi"
import { parseEther, formatEther } from "viem"
import { Address } from "viem"
import { POLKING_ADDRESS } from "@/utils/contract-utils"
import { useToast } from "@/context/toast-context"
import POLKING_ABI from "@/app/contracts/POLKING.json"
import type { UseWriteContractReturnType } from "wagmi"

interface PlanDetails {
  plan: string
  planRange: string
  duration: string
  maxRewards: string
  bestFor: string
  minAmount: number
  maxAmount: number
}

interface StakeCardProps {
  amount: number
  balance: number
  onAmountChange: (amount: number) => void
  onStake: () => void
  onMaxClick: () => void
}

const StakeCard: React.FC<StakeCardProps> = ({ amount, balance, onAmountChange, onStake, onMaxClick }) => {
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [previousBalance, setPreviousBalance] = useState(balance)
  const [isBalanceUpdated, setIsBalanceUpdated] = useState(false)
  const [previousPlan, setPreviousPlan] = useState<string | null>(null)
  const [showPlanChangeIndicator, setShowPlanChangeIndicator] = useState(false)

  // Define all plans
  const plans = [
    {
      plan: "Plan 1",
      planRange: "1 - 999 POL",
      duration: "200 Days",
      maxRewards: "300%",
      bestFor: "New Stakers",
      minAmount: 1,
      maxAmount: 999,
    },
    {
      plan: "Plan 2",
      planRange: "1000 - 2999 POL",
      duration: "150 Days",
      maxRewards: "300%",
      bestFor: "Medium Stakers",
      minAmount: 1000,
      maxAmount: 2999,
    },
    {
      plan: "Plan 3",
      planRange: "3000 - 100000 POL",
      duration: "100 Days",
      maxRewards: "300%",
      bestFor: "Large Stakers",
      minAmount: 3000,
      maxAmount: 100000,
    },
  ]

  // Determine current plan based on amount
  const getCurrentPlan = (value: number): PlanDetails => {
    for (const plan of plans) {
      if (value >= plan.minAmount && value <= plan.maxAmount) {
        return plan
      }
    }
    // Default to first plan if amount is 0 or less
    return value <= 0 ? plans[0] : plans[plans.length - 1]
  }

  const currentPlan = getCurrentPlan(amount)

  // Track plan changes for animation
  useEffect(() => {
    const newPlan = getCurrentPlan(amount).plan

    if (previousPlan && previousPlan !== newPlan) {
      setShowPlanChangeIndicator(true)

      const timer = setTimeout(() => {
        setShowPlanChangeIndicator(false)
      }, 2000)

      return () => clearTimeout(timer)
    }

    setPreviousPlan(newPlan)
  }, [amount, previousPlan])

  // Track balance changes for animation
  useEffect(() => {
    if (balance !== previousBalance) {
      setIsBalanceUpdated(true)
      const timer = setTimeout(() => {
        setIsBalanceUpdated(false)
        setPreviousBalance(balance)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [balance, previousBalance])

  // Format number with spaces instead of commas, with decimals
  const formatNumber = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || isNaN(Number(num))) return "0"

    // Convert to string and handle formatting with decimals
    const numStr = Number(num).toString()
    const parts = numStr.split(".")

    // Format the integer part with spaces
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")

    // If there's a decimal part, append it
    if (parts.length > 1) {
      return `${integerPart}.${parts[1]}`
    }

    return integerPart
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove spaces but keep decimal points
    const raw = e.target.value.replace(/\s/g, "")

    // Validate that it's a valid number with at most 2 decimal places
    if (!/^(\d+)?(\.\d{0,2})?$/.test(raw) && raw !== "") return

    // Check if it exceeds the maximum
    const value = Number.parseFloat(raw)
    if (value > 100000) return

    onAmountChange(isNaN(value) ? 0 : value)
  }

  // Check if amount exceeds balance
  const isExceedingBalance = amount > balance

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      <div
        className={`rounded-2xl p-5 sm:p-6 relative z-10 ${
          isInputFocused
            ? "border border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)]"
            : "border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)]"
        }`}
      >
        {/* Current Plan Indicator with Change Animation */}
        <motion.div
          className="mb-4 flex items-center justify-center"
          animate={{
            y: showPlanChangeIndicator ? [0, -5, 0] : 0,
            transition: { duration: 0.5 },
          }}
        >
          <motion.div
            className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-full px-4 py-1.5 border border-[#a58af8]/30 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 relative z-10">
              <Shield className="w-4 h-4 text-[#a58af8]" />
              <p className="text-white font-medium text-sm">
                {currentPlan.plan}
                {showPlanChangeIndicator && (
                  <span className="ml-1 text-[#facc15] text-xs animate-pulse">(Auto-selected)</span>
                )}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Plan Details */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Plan Range */}
          <motion.div
            className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20 relative overflow-hidden"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 20px rgba(165, 138, 248, 0.5)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5 text-[#a58af8]" />
              <p className="text-white/80 text-xs">Plan Range</p>
            </div>
            <p className="text-sm font-semibold text-white">{currentPlan.planRange}</p>
          </motion.div>

          {/* Duration */}
          <motion.div
            className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20 relative overflow-hidden"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 20px rgba(165, 138, 248, 0.5)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                  ease: "linear",
                }}
              >
                <Clock className="w-3.5 h-3.5 text-[#a58af8]" />
              </motion.div>
              <p className="text-white/80 text-xs">Duration</p>
            </div>
            <p className="text-sm font-semibold text-white">{currentPlan.duration}</p>
          </motion.div>

          {/* Max Rewards */}
          <motion.div
            className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20 relative overflow-hidden"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 20px rgba(165, 138, 248, 0.5)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <motion.div
                animate={{
                  y: [0, -1, 0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
              </motion.div>
              <p className="text-white/80 text-xs">Max Rewards</p>
            </div>
            <p className="text-sm font-semibold text-white">{currentPlan.maxRewards}</p>
          </motion.div>

          {/* Best For */}
          <motion.div
            className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20 relative overflow-hidden"
            whileHover={{
              scale: 1.03,
              boxShadow: "0 0 20px rgba(165, 138, 248, 0.5)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-[#a58af8]" />
              <p className="text-white/80 text-xs">Best For</p>
            </div>
            <p className="text-sm font-semibold text-white">{currentPlan.bestFor}</p>
          </motion.div>
        </div>

        {/* Input Amount + Max Button */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-white/80 mb-2">Enter Stake Amount (POL)</label>
          <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
              <motion.input
                type="text"
                inputMode="decimal"
                value={formatNumber(amount)}
                onChange={handleInputChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                whileFocus={{ boxShadow: "0 0 0 2px rgba(250, 204, 21, 0.5)" }}
                className={`w-full rounded-xl bg-[#0f0c1a]/70 backdrop-blur-sm border px-4 py-2.5 text-base text-white focus:outline-none focus:ring-2 focus:ring-[#facc15] transition-all ${
                  isExceedingBalance ? "border-red-500" : "border-[#a58af8]/30"
                }`}
                placeholder="Enter amount"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 text-sm">POL</div>
            </div>
            <motion.button
              onClick={onMaxClick}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 15px rgba(250, 204, 21, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              className="whitespace-nowrap text-sm font-medium bg-[#0f0c1a]/70 backdrop-blur-sm text-[#facc15] border border-[#facc15]/30 hover:border-[#facc15] rounded-xl px-3 py-2.5 transition-all"
            >
              Max
            </motion.button>
          </div>

          {/* Balance Display with Animation */}
          <div className="mt-2 flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-[#a58af8]" />
            <AnimatePresence mode="wait">
              <motion.div
                key={isBalanceUpdated ? "updating" : "static"}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center"
              >
                <span className="text-xs text-white/80 mr-1">Balance:</span>
                <span
                  className={`text-xs font-medium ${
                    isBalanceUpdated ? "text-[#facc15]" : isExceedingBalance ? "text-red-400" : "text-white"
                  }`}
                >
                  {formatNumber(balance)} MATIC
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Error message for exceeding balance */}
            {isExceedingBalance && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 ml-1">
                Insufficient balance
              </motion.span>
            )}
          </div>
        </div>

        {/* Stake Button */}
        <div className="relative group">
          <AnimatePresence>
            <motion.div
              className="absolute -inset-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500 group-hover:duration-200"
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.01, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </AnimatePresence>

          <motion.button
            onClick={onStake}
            disabled={amount <= 0 || isExceedingBalance}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0f0824] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
          >
            <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15] text-base relative z-10">
              {amount <= 0 ? "Enter Amount" : isExceedingBalance ? "Insufficient Balance" : "Stake Now"}
            </span>

            {amount > 0 && !isExceedingBalance && (
              <motion.span
                className="absolute bottom-0 left-1/2 h-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] -translate-x-1/2"
                initial={{ width: 0 }}
                animate={{ width: "calc(100% - 20px)" }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function StakingInterface() {
  const { address, isConnected } = useAccount()
  const { showToast } = useToast()
  
  // Get native MATIC balance
  const { data: maticBalance } = useBalance({
    address
  })

  const [stakeAmount, setStakeAmount] = useState(0)
  const [userBalance, setUserBalance] = useState(0)
  const [stakingHistory, setStakingHistory] = useState<Array<{ amount: number; timestamp: Date; plan: string }>>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isStaking, setIsStaking] = useState(false)
  const [referrerAddress, setReferrerAddress] = useState<Address>("0x0000000000000000000000000000000000000000" as Address)

  // Setup contract write
  const { writeContract, data: hash } = useWriteContract()

  // Wait for transaction
  const { isLoading: isTransactionPending, isSuccess: isTransactionSuccess } = useTransaction({
    hash,
  })

  // Update MATIC balance when data changes
  useEffect(() => {
    if (maticBalance) {
      setUserBalance(Number(formatEther(maticBalance.value)))
    }
  }, [maticBalance])

  // Handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      // Get current plan for the staked amount
      const currentPlan = getCurrentPlan(stakeAmount)
      
      // Add to staking history
      setStakingHistory((prev) => [{ amount: stakeAmount, timestamp: new Date(), plan: currentPlan }, ...prev])
      
      showToast({
        type: "success",
        title: "Staking Successful",
        message: `Successfully staked ${stakeAmount} MATIC!`
      })
      
      // Reset stake amount
      setStakeAmount(0)
    }
  }, [isTransactionSuccess, stakeAmount])

  // Get referrer from URL if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const ref = urlParams.get('ref')
      if (ref && ref.startsWith('0x')) {
        setReferrerAddress(ref as Address)
      }
    }
  }, [])

  // Define all plans for consistency
  const plans = [
    {
      plan: "Plan 1",
      minAmount: 1,
      maxAmount: 999,
      duration: "200 Days",
    },
    {
      plan: "Plan 2",
      minAmount: 1000,
      maxAmount: 2999,
      duration: "150 Days",
    },
    {
      plan: "Plan 3",
      minAmount: 3000,
      maxAmount: 100000,
      duration: "100 Days",
    },
  ]

  // Determine current plan based on amount
  const getCurrentPlan = (value: number): string => {
    for (const plan of plans) {
      if (value >= plan.minAmount && value <= plan.maxAmount) {
        return plan.plan
      }
    }
    return value <= 0 ? plans[0].plan : plans[plans.length - 1].plan
  }

  const handleStake = async () => {
    if (!writeContract || stakeAmount <= 0 || stakeAmount > userBalance || !isConnected) return
    
    try {
      setIsStaking(true)
      await writeContract({
        abi: POLKING_ABI.abi,
        address: POLKING_ADDRESS,
        functionName: "stake",
        args: [referrerAddress],
        value: parseEther(stakeAmount.toString()),
      })
      
      // Show success message for transaction submission
      setShowSuccessMessage(true)
      setTimeout(() => setShowSuccessMessage(false), 3000)
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

  const handleMaxClick = () => {
    setStakeAmount(userBalance)
  }

  // Update the success message text
  const getSuccessMessage = () => {
    if (isTransactionPending) {
      return "Transaction pending... Please wait for confirmation"
    }
    return `Transaction submitted! Staking ${formatNumber(stakeAmount)} MATIC`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        {/* Success Message */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-center"
            >
              <p className="text-green-400 font-medium">{getSuccessMessage()}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <StakeCard
          amount={stakeAmount}
          balance={userBalance}
          onAmountChange={setStakeAmount}
          onStake={handleStake}
          onMaxClick={handleMaxClick}
        />

        {/* Staking History */}
        {stakingHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 border border-[#a58af8]/30 rounded-xl"
          >
            <h3 className="text-white font-medium mb-3">Recent Staking Activity</h3>
            <div className="space-y-2">
              {stakingHistory.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center p-2 bg-[#0f0c1a]/70 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#a58af8]" />
                    <span className="text-white text-sm">
                      Staked {formatNumber(item.amount)} MATIC
                      <span className="ml-1 text-xs text-[#facc15]">({item.plan})</span>
                    </span>
                  </div>
                  <span className="text-white/60 text-xs">{item.timestamp.toLocaleTimeString()}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Helper function for formatting numbers
function formatNumber(num: number | string | undefined | null) {
  if (num === undefined || num === null || isNaN(Number(num))) return "0"

  // Convert to string and handle formatting with decimals
  const numStr = Number(num).toString()
  const parts = numStr.split(".")

  // Format the integer part with spaces
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")

  // If there's a decimal part, append it
  if (parts.length > 1) {
    return `${integerPart}.${parts[1]}`
  }

  return integerPart
}
