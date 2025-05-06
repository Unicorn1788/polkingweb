"use client"

import { useState, useEffect } from "react"
import { Shield, TrendingUp, Award, Zap, User, Info, Clock, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/context/wallet-context"
import { useContractRead, useReadContract, useWriteContract } from "wagmi"
import { POLKING_ADDRESS, contractConfig } from "@/utils/contract-utils"
import { formatEther, Address } from "viem"
import { abi as POLKING_ABI } from "@/app/contracts/POLKING.json"
import { useToast } from "@/context/toast-context"

// Define rank types
type RankType = 0 | 1 | 2 | 3 | 4;

// Define rank progression data
const rankProgressionData = {
  0: {
    name: "Recruit",
    level: 0,
    boost: 0,
    poolShare: 0,
    nextRank: "Soldier",
    requiredVolume: 5000,
    upgradeTime: 25 * 24 * 60 * 60, // 25 days in seconds
  },
  1: {
    name: "Soldier",
    level: 1,
    boost: 5,
    poolShare: 5,
    nextRank: "Knight",
    requiredVolume: 15000,
    upgradeTime: 50 * 24 * 60 * 60, // 50 days in seconds
  },
  2: {
    name: "Knight",
    level: 2,
    boost: 10,
    poolShare: 10,
    nextRank: "Duke",
    requiredVolume: 45000,
    upgradeTime: 25 * 24 * 60 * 60, // 25 days in seconds
  },
  3: {
    name: "Duke",
    level: 3,
    boost: 15,
    poolShare: 15,
    nextRank: "King",
    requiredVolume: 100000,
    upgradeTime: 25 * 24 * 60 * 60, // 25 days in seconds
  },
  4: {
    name: "King",
    level: 4,
    boost: 20,
    poolShare: 20,
    nextRank: null,
    requiredVolume: null,
    upgradeTime: 0,
  },
} as const;

// Define burn requirements by rank
const burnRequirements = {
  0: 1000,
  1: 12000,
  2: 20000,
  3: 50000,
  4: 0,
} as const;

// Define branch totals type
interface BranchTotals {
  top1Address: Address;
  top1Volume: bigint;
  top2Address: Address;
  top2Volume: bigint;
}

const NFTBoosterSection = () => {
  const { address, openWalletModal } = useWallet()
  const [upgradeTimestamp, setUpgradeTimestamp] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [hasStaked, setHasStaked] = useState(false)
  const [showBurnModal, setShowBurnModal] = useState(false)
  const [burnAmount, setBurnAmount] = useState("")
  const [balance, setBalance] = useState(0)
  const { showToast } = useToast()

  // Get user's current rank
  const { data: userRank, isLoading: rankLoading } = useReadContract({
    address: POLKING_ADDRESS,
    abi: POLKING_ABI,
    functionName: 'getUserRank',
    args: [address || "0x0000000000000000000000000000000000000000" as Address],
  })

  // Get top 2 branch totals
  const { data: branchTotals, isLoading: branchLoading } = useReadContract({
    address: POLKING_ADDRESS,
    abi: POLKING_ABI,
    functionName: 'getTop2BranchTotals',
    args: [address || "0x0000000000000000000000000000000000000000" as Address],
  })

  // Get user balance
  const { data: userBalance } = useReadContract ({
    address: POLKING_ADDRESS,
    abi: POLKING_ABI,
    functionName: 'balanceOf',
    args: [address || "0x0000000000000000000000000000000000000000" as Address],
  })

  // Extract current rank data
  const currentRank = rankProgressionData[Number(userRank || 0) as RankType]

  // Extract branch totals data
  const { top1Address, top1Volume, top2Address, top2Volume } = (branchTotals as BranchTotals) || {
    top1Address: "0x0000000000000000000000000000000000000000" as Address,
    top1Volume: BigInt(0),
    top2Address: "0x0000000000000000000000000000000000000000" as Address,
    top2Volume: BigInt(0)
  }

  // Format number with spaces instead of commas
  const formatNumber = (num: number | bigint | null | undefined) => {
    if (num === null || num === undefined) return "0"
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  // Calculate progress percentages for branches
  const getProgressPercentage = (volume: bigint) => {
    if (!currentRank.requiredVolume) return 0
    return Math.min(100, (Number(volume) / currentRank.requiredVolume) * 100)
  }

  const top1Progress = getProgressPercentage(top1Volume)
  const top2Progress = getProgressPercentage(top2Volume)

  // Initialize affiliates state with default values
  const [affiliates, setAffiliates] = useState([
    {
      address: "0x0000000000000000000000000000000000000000" as Address,
      volume: 0,
      targetVolume: 0,
      progress: 0
    },
    {
      address: "0x0000000000000000000000000000000000000000" as Address,
      volume: 0,
      targetVolume: 0,
      progress: 0
    }
  ])

  useEffect(() => {
    // Check if user has staked
    const stakedTimestamp = localStorage.getItem("first_stake_timestamp")
    if (stakedTimestamp) {
      setHasStaked(true)
      // If user is recruit and has staked, use stake timestamp
      if (Number(userRank || 0) === 0) {
        setUpgradeTimestamp(parseInt(stakedTimestamp))
      } else {
        // For other ranks, use upgrade timestamp
        const savedTimestamp = localStorage.getItem(`rank_upgrade_${Number(userRank || 0)}`)
        if (savedTimestamp) {
          setUpgradeTimestamp(parseInt(savedTimestamp))
        } else {
          setUpgradeTimestamp(null)
        }
      }
    } else {
      setHasStaked(false)
      setUpgradeTimestamp(null)
    }
  }, [userRank])

  useEffect(() => {
    if (!upgradeTimestamp || !currentRank.upgradeTime) return

    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const elapsed = now - upgradeTimestamp
      const remaining = Math.max(0, currentRank.upgradeTime - elapsed)
      setTimeLeft(remaining)
    }, 1000)

    return () => clearInterval(timer)
  }, [upgradeTimestamp, currentRank.upgradeTime])

  useEffect(() => {
    if (userBalance) {
      setBalance(Number(formatEther(userBalance as bigint)))
    }
  }, [userBalance])

  const daysLeft = Math.floor(timeLeft / (24 * 60 * 60))
  const progress = currentRank.upgradeTime ? ((currentRank.upgradeTime - timeLeft) / currentRank.upgradeTime) * 100 : 0

  // Update affiliates when branch totals change
  useEffect(() => {
    if (branchTotals) {
      const { top1Address, top1Volume, top2Address, top2Volume } = branchTotals as BranchTotals
      const targetVolume = currentRank.requiredVolume || 0
      
      setAffiliates([
        {
          address: top1Address,
          volume: top1Volume ? Number(formatEther(top1Volume)) : 0,
          targetVolume,
          progress: top1Progress
        },
        {
          address: top2Address,
          volume: top2Volume ? Number(formatEther(top2Volume)) : 0,
          targetVolume,
          progress: top2Progress
        }
      ])
    }
  }, [branchTotals, currentRank.requiredVolume, top1Progress, top2Progress])

  const [hoveredAddress, setHoveredAddress] = useState<number | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)

  // Add contract write hooks
  const { writeContract: writeFastTrack } = useWriteContract()
  const { writeContract: writeUpgradeRank } = useWriteContract()

  // Handle burn action
  const handleBurn = async () => {
    const requiredAmount = getBurnRequirement(Number(userRank || 0))
    if (!requiredAmount || !address) return

    try {
      showToast({ type: "loading", title: "Processing Burn", message: "Please wait while we process your transaction" })
      await writeFastTrack({
        address: POLKING_ADDRESS,
        abi: POLKING_ABI,
        functionName: "processfastTrackCooldown",
        args: [BigInt(requiredAmount)],
      })
      showToast({ type: "success", title: "Burn Successful", message: `Successfully burned ${formatNumber(requiredAmount)} PK` })
      setShowBurnModal(false)
    } catch (error) {
      console.error("Error burning tokens:", error)
      showToast({ type: "error", title: "Burn Failed", message: "Failed to burn tokens. Please try again." })
    }
  }

  // Handle upgrade rank
  const handleUpgradeRank = async () => {
    if (!address) {
      openWalletModal()
      return
    }

    try {
      showToast({ type: "loading", title: "Processing Upgrade", message: "Please wait while we process your rank upgrade" })
      await writeUpgradeRank({
        address: POLKING_ADDRESS,
        abi: POLKING_ABI,
        functionName: "claimRank",
      })
      showToast({ type: "success", title: "Rank Upgraded", message: `Successfully upgraded to ${currentRank.nextRank}` })
    } catch (error) {
      console.error("Error upgrading rank:", error)
      showToast({ type: "error", title: "Upgrade Failed", message: "Failed to upgrade rank. Please try again." })
    }
  }

  // Handle info tooltip
  const toggleTooltip = () => {
    setShowTooltip(!showTooltip)
  }

  // Update burn requirement references
  const getBurnRequirement = (rank: number) => {
    return burnRequirements[rank as RankType] || 0
  }

  // Update burn button text
  const getBurnButtonText = () => {
    const amount = getBurnRequirement(Number(userRank || 0))
    return `Burn ${formatNumber(amount)} PK`
  }

  return (
    <section className="relative py-8 sm:py-12 bg-gradient-to-br from-[#0a0118] to-[#120630] text-white px-4 sm:px-6 md:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Blurred shapes */}
        <div className="absolute top-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[#a58af8]/10 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[30vw] h-[30vw] rounded-full bg-[#facc15]/10 blur-[80px]" />

        {/* Animated elements */}
        <motion.div
          animate={{
            x: ["5%", "-5%"],
            y: ["3%", "-3%"],
          }}
          transition={{
            x: { duration: 22, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            y: { duration: 18, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
          }}
          className="absolute top-[30%] left-[30%] w-[25vw] h-[25vw] rounded-full bg-[#a58af8]/5 blur-[100px]"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 sm:mb-5 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 relative inline-block">
            <span className="text-gradient-gold">NFT Rank Progress</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Boost your staking rewards with NFT ranks. Upgrade your rank to increase your MaxCap and earn a share of the
            global pool.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)] overflow-hidden"
        >
          {rankLoading || branchLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#a58af8]"></div>
              <span className="ml-3 text-white/70">Loading rank data...</span>
            </div>
          ) : (
            <>
              {/* Current Rank Badge - More compact with reduced padding */}
              <div className="flex flex-col items-center justify-center py-3 sm:py-4 border-b border-[#a58af8]/20">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 10px rgba(165,138,248,0.4)",
                      "0 0 20px rgba(165,138,248,0.6)",
                      "0 0 10px rgba(165,138,248,0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#1a1224] to-[#0f0c1a] border-2 border-[#a58af8] flex items-center justify-center mb-2 sm:mb-3"
                >
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-[#a58af8]" />
                </motion.div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{currentRank.name}</h3>
                <div className="mt-0.5 px-2 py-0.5 bg-[#0f0c1a]/70 rounded-full border border-[#a58af8]/30 text-xs text-white/70">
                  Level {currentRank.level}
                </div>
              </div>

              <div className="p-3 sm:p-5">
                {/* Progress to Next Rank Section - More compact */}
                {currentRank.nextRank && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#a58af8]" />
                        <h4 className="text-sm font-semibold text-white/90">Progress to {currentRank.nextRank}</h4>
                      </div>

                      <div className="relative">
                        <button
                          onClick={toggleTooltip}
                          className="w-5 h-5 rounded-full bg-[#0f0c1a]/70 border border-[#a58af8]/30 flex items-center justify-center hover:border-[#a58af8]/60 transition-colors"
                        >
                          <Info size={10} className="text-[#a58af8]" />
                        </button>

                        <AnimatePresence>
                          {showTooltip && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 top-full mt-2 w-64 p-2.5 rounded-xl bg-[#0f0c1a] border border-[#a58af8]/30 shadow-lg z-10 text-xs text-white/80"
                            >
                              To upgrade to {currentRank.nextRank} rank, you need two downlines with a total of{" "}
                              {formatNumber(currentRank.requiredVolume || 0)} PK volume. Higher ranks unlock increased
                              rewards and pool shares.
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Volume requirement info - More compact */}
                    <div className="bg-[#0f0c1a]/50 rounded-xl p-2 border border-[#a58af8]/20 mb-3">
                      <p className="text-xs text-white/80 text-center">
                        You need{" "}
                        <span className="text-[#facc15] font-medium">
                          {formatNumber(currentRank.requiredVolume || 0)} PK
                        </span>{" "}
                        in 2 lines total volume to reach {currentRank.nextRank} rank
                      </p>
                    </div>

                    {/* Affiliate Progress Bars - Tighter stacking */}
                    <div className="space-y-2.5">
                      {affiliates.map((affiliate, index) => {
                        const progressPercent = index === 0 ? top1Progress : top2Progress

                        return (
                          <div
                            key={index}
                            className="bg-[#0f0c1a]/50 rounded-xl p-2.5 border border-[#a58af8]/20 hover:border-[#a58af8]/40 transition-all duration-300"
                            onMouseEnter={() => setHoveredAddress(index)}
                            onMouseLeave={() => setHoveredAddress(null)}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 rounded-full bg-[#0f0c1a] border border-[#a58af8]/40 flex items-center justify-center flex-shrink-0">
                                  <User size={10} className="text-[#a58af8]" />
                                </div>
                                <p className="text-xs font-medium text-white/90 truncate">
                                  {affiliate.address && affiliate.address !== "0x0000000000000000000000000000000000000000" 
                                    ? `${affiliate.address.slice(0, 6)}...${affiliate.address.slice(-4)}`
                                    : index === 0 && top1Address && top1Address !== "0x0000000000000000000000000000000000000000"
                                    ? `${top1Address.slice(0, 6)}...${top1Address.slice(-4)}`
                                    : index === 1 && top2Address && top2Address !== "0x0000000000000000000000000000000000000000"
                                    ? `${top2Address.slice(0, 6)}...${top2Address.slice(-4)}`
                                    : "No affiliate yet"
                                  }
                                </p>
                              </div>
                              <p className="text-[10px] font-medium text-[#facc15]">
                                {progressPercent.toFixed(0)}% Complete
                              </p>
                            </div>

                            <div className="relative h-1.5 bg-[#0f0c1a]/70 rounded-full overflow-hidden border border-[#a58af8]/20">
                              <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-full"
                              >
                                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.1)_100%)] animate-shimmer-effect"></div>
                              </motion.div>

                              {/* Hover tooltip */}
                              <AnimatePresence>
                                {hoveredAddress === index && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: -25 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="absolute left-1/2 -translate-x-1/2 -top-1 px-2 py-0.5 rounded-md bg-[#0f0c1a] border border-[#a58af8]/30 text-[10px] text-white whitespace-nowrap"
                                  >
                                    {formatNumber(affiliate.volume)} / {formatNumber(affiliate.targetVolume)} PK
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className="flex justify-between mt-1 text-[10px] text-white/50">
                              <span>Current: {formatNumber(affiliate.volume)} PK</span>
                              <span>Target: {formatNumber(affiliate.targetVolume)} PK</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Time Progression Box */}
                {currentRank.nextRank && (
                  <div className="bg-[#0f0c1a]/50 rounded-xl p-2.5 border border-[#a58af8]/20 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#a58af8]" />
                        <h4 className="text-sm font-semibold text-white/90">Time to {currentRank.nextRank}</h4>
                      </div>
                      <p className="text-[10px] font-medium text-[#facc15]">
                        {Number(userRank || 0) === 0 && !hasStaked ? (
                          "Start staking to begin"
                        ) : upgradeTimestamp ? (
                          `${daysLeft} days remaining`
                        ) : (
                          "Not started"
                        )}
                      </p>
                    </div>

                    <div className="relative h-1.5 bg-[#0f0c1a]/70 rounded-full overflow-hidden border border-[#a58af8]/20">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-full"
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.1)_100%)] animate-shimmer-effect"></div>
                      </motion.div>
                      <span className="absolute right-0 -bottom-5 text-[10px] text-white/50">End: 0 days</span>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-2 text-[10px] text-white/50">
                        <span>Days: {daysLeft} / {currentRank.upgradeTime / (24 * 60 * 60)} days</span>
                      </div>
                      <div className="text-[10px] text-[#facc15]">
                        Balance: {formatNumber(balance)} PK
                      </div>
                    </div>
                    <button
                      onClick={() => setShowBurnModal(true)}
                      className="w-full mt-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-lg text-black hover:opacity-90 transition-all duration-300"
                    >
                      {getBurnButtonText()}
                    </button>
                  </div>
                )}

                {/* Current Boost and Global Pool Share - More compact with smaller height */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-[#0f0c1a]/70 backdrop-blur-md rounded-xl p-2.5 border border-[#a58af8]/20 text-center transition-all duration-300 hover:border-[#a58af8]/50 hover:shadow-[0_0_20px_rgba(165,138,248,0.3)]">
                    <p className="text-white/60 text-xs mb-1">Current Boost</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#a58af8]" />
                      <p className="text-base font-bold text-white">+{currentRank.boost}%</p>
                    </div>
                  </div>

                  <div className="bg-[#0f0c1a]/70 backdrop-blur-md rounded-xl p-2.5 border border-[#a58af8]/20 text-center transition-all duration-300 hover:border-[#a58af8]/50 hover:shadow-[0_0_20px_rgba(165,138,248,0.3)]">
                    <p className="text-white/60 text-xs mb-1">Global Pool Share</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
                      <p className="text-base font-bold text-white">{currentRank.poolShare}%</p>
                    </div>
                  </div>
                </div>

                {/* Upgrade Button - Smaller height */}
                <div className="relative group">
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="absolute -inset-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-xl blur opacity-30"
                  ></motion.div>

                  <button
                    onClick={handleUpgradeRank}
                    className="relative w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 bg-[#0f0824] text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15] hover:shadow-[0_0_20px_rgba(165,138,248,0.4)]"
                  >
                    {currentRank.nextRank ? `Upgrade to ${currentRank.nextRank}` : "Maximum Rank Achieved"}

                    {/* Animated border line */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] group-hover:w-[calc(100%-20px)] -translate-x-1/2 transition-all duration-300"></span>
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Burn Modal */}
        <AnimatePresence>
          {showBurnModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#0f0c1a] border border-[#a58af8]/30 rounded-xl p-4 w-full max-w-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">Burn PK to Upgrade</h3>
                  <button
                    onClick={() => setShowBurnModal(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-white/70 mb-2">
                    Burn {formatNumber(getBurnRequirement(Number(userRank || 0)))} PK to instantly upgrade to {currentRank.nextRank}
                  </p>
                  <div className="w-full px-3 py-2 bg-[#0a0118] border border-[#a58af8]/30 rounded-lg text-white flex items-center justify-between">
                    <span className="text-white/70">Amount to burn:</span>
                    <span className="font-semibold text-[#facc15]">{formatNumber(getBurnRequirement(Number(userRank || 0)))} PK</span>
                  </div>
                </div>

                <button
                  onClick={handleBurn}
                  className="w-full px-4 py-2 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-lg text-black font-semibold hover:opacity-90 transition-opacity"
                >
                  Burn {formatNumber(getBurnRequirement(Number(userRank || 0)))} PK
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default NFTBoosterSection
