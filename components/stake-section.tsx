"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Clock, TrendingUp, Users, Shield, Wallet, ChevronDown, ChevronUp, User } from "lucide-react"
import { useAccount, useBalance, useWriteContract, useTransaction, useReadContract, usePublicClient } from "wagmi"
import { readContract } from "viem/actions"
import { parseEther, formatEther } from "viem"
import { Address } from "viem"
import { POLKING_ADDRESS } from "@/lib/wagmi-config"
import { useToast } from "@/context/toast-context"
import POLKING_ABI from "@/app/contracts/POLKING.json"
import type { UseWriteContractReturnType } from "wagmi"
import { useStakingQuery } from '@/hooks/use-staking-query'

// Define ABI for the specific functions we're using
const stakingAbi = [
  {
    type: 'function',
    name: 'activeStakesCount',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'activeStakes',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'index', type: 'uint256' }
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'stakes',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'stakeId', type: 'uint256' }
    ],
    outputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'claimed', type: 'uint256' },
      { name: 'rewardsClaimed', type: 'uint256' },
      { name: 'lastClaimedTime', type: 'uint256' },
      { name: 'remainingCap', type: 'uint256' },
      { name: 'plan', type: 'uint8' },
      { name: 'active', type: 'bool' }
    ],
  },
] as const;

interface StakeInfo {
  id: number;
  amount: bigint;
  startTime: bigint;
  claimed: bigint;
  rewardsClaimed: bigint;
  lastClaimedTime: bigint;
  remainingCap: bigint;
  plan: number;
  active: boolean;
}

const StakeSection = () => {
  const { address, isConnected } = useAccount()
  const { showToast } = useToast()
  const publicClient = usePublicClient()
  
  // Get native MATIC balance
  const { data: maticBalance } = useBalance({
    address,
  })

  const [amount, setAmount] = useState<number>(0)
  const [contractType, setContractType] = useState("plan1")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [balance, setBalance] = useState(0)
  const [isContractsOpen, setIsContractsOpen] = useState(false)
  const [referrerAddress, setReferrerAddress] = useState<Address>("0x0000000000000000000000000000000000000000" as Address)
  const [activeStakes, setActiveStakes] = useState<StakeInfo[]>([])
  const [isStaking, setIsStaking] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>()

  // Setup contract write
  const { writeContract, data: hash } = useWriteContract()

  // Wait for transaction
  const { isLoading: isTransactionPending, isSuccess: isTransactionSuccess } = useTransaction({
    hash,
  })

  // Read active stakes count
  const { data: activeStakesCount } = useReadContract({
    address: POLKING_ADDRESS,
    abi: stakingAbi,
    functionName: "activeStakesCount",
    args: isConnected && address ? [address] : undefined,
  })

  // Read all active stakes
  useEffect(() => {
    const fetchActiveStakes = async () => {
      if (!isConnected || !address || !publicClient) {
        setActiveStakes([]);
        return;
      }

      if (!activeStakesCount) return;
      
      try {
        const count = Number(activeStakesCount);
        const stakes: StakeInfo[] = [];
        
        // Fetch all stake IDs first
        const stakeIds = await Promise.all(
          Array.from({ length: count }, (_, i) => 
            publicClient.readContract({
              address: POLKING_ADDRESS,
              abi: stakingAbi,
              functionName: "activeStakes",
              args: [address, BigInt(i)],
            })
          )
        );

        // Fetch all stake details in parallel
        const stakeDetails = await Promise.all(
          stakeIds.map(stakeId =>
            publicClient.readContract({
              address: POLKING_ADDRESS,
              abi: stakingAbi,
              functionName: "stakes",
              args: [address, stakeId],
            })
          )
        );

        // Process all stakes
        stakeDetails.forEach((details, index) => {
          if (details) {
            const [
              amount,
              startTime,
              claimed,
              rewardsClaimed,
              lastClaimedTime,
              remainingCap,
              plan,
              active
            ] = details;

            if (active) {
              stakes.push({
                id: Number(stakeIds[index]),
                amount,
                startTime,
                claimed,
                rewardsClaimed,
                lastClaimedTime,
                remainingCap,
                plan,
                active,
              });
            }
          }
        });

        setActiveStakes(stakes);
      } catch (error) {
        console.error("Error fetching stakes:", error);
        setActiveStakes([]);
      }
    };

    fetchActiveStakes();
  }, [activeStakesCount, address, publicClient, isConnected]);

  // Update MATIC balance when data changes
  useEffect(() => {
    if (maticBalance) {
      setBalance(Number(formatEther(maticBalance.value)))
    }
  }, [maticBalance])

  // Handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      showToast({
        type: "success",
        title: "Staking Successful",
        message: `Successfully staked ${amount} POL!`
      })
      setAmount(0)
      setTxHash(undefined)
    }
  }, [isTransactionSuccess, amount, showToast])

  // Detect referrer from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const ref = urlParams.get('ref')
      if (ref && ref.startsWith('0x')) {
        setReferrerAddress(ref as Address)
      }
    }
  }, [])

  // Plan details
  const planDetails = {
    plan1: {
      tier: "Tier 1",
      tierRange: "1 - 999 POL",
      duration: "200 Days",
      maxRewards: "300%",
      bestFor: "New Stakers",
      minAmount: 1,
      maxAmount: 999,
    },
    plan2: {
      tier: "Tier 2",
      tierRange: "1 000 - 2 999 POL",
      duration: "150 Days",
      maxRewards: "300%",
      bestFor: "Intermediate",
      minAmount: 1000,
      maxAmount: 2999,
    },
    plan3: {
      tier: "Tier 3",
      tierRange: "3 000 - 100 000 POL",
      duration: "100 Days",
      maxRewards: "300%",
      bestFor: "Advanced",
      minAmount: 3000,
      maxAmount: 100000,
    },
  }

  // Auto-detect tier based on amount
  useEffect(() => {
    if (amount >= planDetails.plan3.minAmount && amount <= planDetails.plan3.maxAmount) {
      setContractType("plan3")
    } else if (amount >= planDetails.plan2.minAmount && amount <= planDetails.plan2.maxAmount) {
      setContractType("plan2")
    } else if (amount >= planDetails.plan1.minAmount && amount <= planDetails.plan1.maxAmount) {
      setContractType("plan1")
    } else {
      setContractType("plan1")
    }
  }, [amount])

  const currentPlan = planDetails[contractType as keyof typeof planDetails]

  // Format number with spaces instead of commas, no decimals
  const formatNumber = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || isNaN(Number(num))) return '0';
    return Math.floor(Number(num)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s/g, "").replace(/\./g, "")
    const value = Number.parseInt(raw)
    if (value > 100000) return
    setAmount(isNaN(value) ? 0 : value)
  }

  const handleMaxClick = () => {
    setAmount(balance) // Set to current balance
  }

  const {
    stakingPlan,
    planRate,
    stakingAmount,
    activeStakesCount: stakingActiveStakesCount,
    rewardsData,
    stake,
    isStaking: useStakingQueryIsStaking,
  } = useStakingQuery(address)

  // Update stake function
  const handleStake = async () => {
    if (!isConnected) {
      showToast({
        type: "error",
        title: "Wallet Not Connected",
        message: "Please connect your wallet to stake"
      })
      return
    }
    
    if (amount <= 0) {
      showToast({
        type: "error",
        title: "Invalid Amount",
        message: "Please enter an amount to stake"
      })
      return
    }
    
    if (amount > balance) {
      showToast({
        type: "error",
        title: "Insufficient Balance",
        message: "You don't have enough POL to stake this amount"
      })
      return
    }
    
    try {
      setIsStaking(true)
      await stake(amount)
      setAmount(0)
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

  // Update the button state
  const isButtonDisabled = amount <= 0 || amount > balance || !isConnected || isStaking || isTransactionPending

  // Update the button text
  const getButtonText = () => {
    if (isTransactionPending) return "Transaction Pending..."
    if (isStaking) return "Staking..."
    if (amount <= 0) return "Enter Amount"
    if (amount > balance) return "Insufficient Balance"
    if (!isConnected) return "Connect Wallet"
    return "Stake Now"
  }

  // Get plan details based on plan number
  const getPlanDetails = (plan: number) => {
    switch (plan) {
      case 0:
        return {
          name: "Plan 1",
          duration: "200 Days",
          maxRewards: "300%",
        };
      case 1:
        return {
          name: "Plan 2",
          duration: "150 Days",
          maxRewards: "300%",
        };
      case 2:
        return {
          name: "Plan 3",
          duration: "100 Days",
          maxRewards: "300%",
        };
      default:
        return {
          name: "Unknown Plan",
          duration: "Unknown",
          maxRewards: "Unknown",
        };
    }
  };

  // Calculate progress percentage
  const calculateProgress = (stake: StakeInfo) => {
    const maxCap = stake.amount * BigInt(3); // 300% max rewards
    if (maxCap === BigInt(0)) return 0;
    return Number((stake.claimed * BigInt(100)) / maxCap);
  };

  return (
    <section
      id="stake-section"
      className="relative bg-gradient-to-br from-[#0a0118] via-[#120630] to-[#0e0424] text-white px-4 sm:px-6 md:px-8 py-8 sm:py-12 overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0118] via-[#120630] to-[#0e0424]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Glowing orbs */}
        <div className="absolute top-[10%] right-[5%] w-[30vw] h-[30vw] rounded-full bg-[#a58af8]/10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/10 blur-[60px]" />
        <div className="absolute top-[40%] right-[15%] w-[20vw] h-[20vw] rounded-full bg-[#a58af8]/5 blur-[100px]" />
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0118]/50 to-[#0a0118] opacity-70" />
        
        {/* Bottom transition gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0118] to-transparent" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-4">
          <h2 className="text-4xl sm:text-5xl font-bold mb-2 relative inline-block">
            <span className="text-gradient-gold">Stake POL</span>
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Stake your POL and earn up to 300% total return over the staking period.
          </p>
        </div>

        {/* Main Staking Card */}
        <div
          className={`rounded-2xl p-4 backdrop-blur-xl transition-all duration-300 mt-2 ${
            isInputFocused
              ? "bg-black/80 border border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)]"
              : "bg-black/40 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)]"
          }`}
        >
          {/* Current Tier Indicator */}
          <div className="mb-3 flex items-center justify-center">
            <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-full px-4 py-1.5 border border-[#a58af8]/30">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#a58af8]" />
                <p className="text-white font-medium text-sm">{currentPlan.tier}</p>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Tier Range */}
            <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-white/80 text-xs">Tier Range</p>
              </div>
              <p className="text-sm font-semibold text-white">{currentPlan.tierRange}</p>
            </div>
             {/* Duration */}
            <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-white/80 text-xs">Duration</p>
              </div>
              <p className="text-sm font-semibold text-white">{currentPlan.duration}</p>
            </div>
             {/* Max Rewards */}
            <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-white/80 text-xs">Max Rewards</p>
              </div>
              <p className="text-sm font-semibold text-white">{currentPlan.maxRewards}</p>
            </div>
             {/* Best For */}
            <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-3 border border-[#a58af8]/20">
              <div className="flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-white/80 text-xs">Best For</p>
              </div>
              <p className="text-sm font-semibold text-white">{currentPlan.bestFor}</p>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm text-white/80">
                Amount to Stake
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="amount"
                  value={formatNumber(amount)}
                  onChange={handleInputChange}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  className="w-full bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl px-4 py-3 text-white border border-[#a58af8]/20 focus:border-[#a58af8] focus:outline-none focus:ring-1 focus:ring-[#a58af8]/20"
                  placeholder="Enter amount"
                />
                <button
                  onClick={handleMaxClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-[#a58af8] hover:text-white transition-colors"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-xs text-white/60">
                  Balance: {formatNumber(balance)} POL
                </p>
              </div>
            </div>

            {/* Stake Button */}
            <button
              onClick={handleStake}
              disabled={isButtonDisabled}
              className="w-full bg-gradient-to-r from-[#a58af8] to-[#facc15] text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getButtonText()}
            </button>
            
            {!isConnected && (
              <p className="text-xs text-center text-yellow-300">Connect your wallet to stake</p>
            )}
          </div>
        </div>

        {/* Staking Contracts Card */}
        <div className="mt-4 rounded-2xl p-4 backdrop-blur-xl bg-black/40 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Active Staking Contracts</h3>
              {stakingActiveStakesCount ? (
                <span className="bg-[#a58af8]/20 text-[#a58af8] text-xs font-medium px-2 py-1 rounded-full">
                  {Number(stakingActiveStakesCount).toString()}
                </span>
              ) : null}
            </div>
            <button
              onClick={() => setIsContractsOpen(!isContractsOpen)}
              className="text-[#a58af8] hover:text-white transition-colors"
            >
              {isContractsOpen ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {isContractsOpen && (
            <div className="space-y-4">
              {activeStakes.length > 0 ? (
                activeStakes.map((stake) => {
                  const planDetails = getPlanDetails(stake.plan);
                  const progress = calculateProgress(stake);
                  
                  return (
                    <div
                      key={stake.id}
                      className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-4 border border-[#a58af8]/20"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-[#a58af8]" />
                          <span className="text-sm font-medium text-white">Stake #{stake.id}</span>
                          <span className="text-xs text-[#a58af8] bg-[#a58af8]/10 px-2 py-0.5 rounded-full">
                            {planDetails.name}
                          </span>
                        </div>
                        <span className="text-sm text-white/60">
                          {new Date(Number(stake.startTime) * 1000).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-white/60">Amount:</span>
                            <span className="text-white ml-2">{formatNumber(Number(formatEther(stake.amount)))} POL</span>
                          </div>
                          <div>
                            <span className="text-white/60">Duration:</span>
                            <span className="text-white ml-2">{planDetails.duration}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Claimed:</span>
                            <span className="text-white ml-2">{formatNumber(Number(formatEther(stake.claimed)))} POL</span>
                          </div>
                          <div>
                            <span className="text-white/60">Remaining:</span>
                            <span className="text-white ml-2">{formatNumber(Number(formatEther(stake.remainingCap)))} POL</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-white/60">Progress</span>
                            <span className="text-[#a58af8]">{progress}%</span>
                          </div>
                          <div className="w-full bg-[#0f0c1a] rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#a58af8] to-[#facc15] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#0f0c1a]/70 backdrop-blur-sm rounded-xl p-4 border border-[#a58af8]/20 text-center">
                  <p className="text-white/70">No active staking contracts yet</p>
                  <p className="text-xs text-white/50 mt-1">Stake POL to earn rewards</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default StakeSection
