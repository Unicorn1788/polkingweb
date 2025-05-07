"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion"
import { Gauge, Wallet, CreditCard, TrendingUp } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { POLKING_ADDRESS } from "@/lib/wagmi-config"
import { toast } from "sonner"
import { formatEther } from "viem"
import { useQuery } from '@tanstack/react-query'
import { useStakingQuery } from '@/hooks/use-staking-query'

// Define ABI for the specific functions we're using
const rewardsAbi = [
  {
    type: 'function',
    name: 'claim',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getRewardsdOverviewData',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'totalPassiveeRewards', type: 'uint256' },
      { name: 'totalActiveRewards', type: 'uint256' },
      { name: 'totalMaticPaid', type: 'uint256' },
      { name: 'totalPKPaid', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getLiveRewardData',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'totalUnclaimed', type: 'uint256' },
      { name: 'rewardsPerSecond', type: 'uint256' },
    ],
  },
] as const;

interface UserTotals {
  totalPassiveRewards: number;
  totalActiveRewards: number;
  totalClaimedPOL: number;
  totalClaimedPK: number;
}

const RewardsOverview = () => {
  const { openWalletModal, isConnected } = useWallet()
  const { address } = useAccount()
  const [liveRewards, setLiveRewards] = useState(0)
  const [rewardsPerSecond, setRewardsPerSecond] = useState(0)
  const { rewardsData, claimRewards, isClaiming } = useStakingQuery(address)
  const lastUpdateTime = useRef(Date.now())
  const springValue = useSpring(0, { stiffness: 100, damping: 30 })
  const displayValue = useMotionValue("0.0000")

  // User totals state
  const [userTotals, setUserTotals] = useState<UserTotals>({
    totalPassiveRewards: 0,
    totalActiveRewards: 0,
    totalClaimedPOL: 0,
    totalClaimedPK: 0,
  })

  // Contract write setup
  const { writeContract, data: hash } = useWriteContract()
  
  // Wait for transaction
  const { isLoading: isTransactionPending, isSuccess: isTransactionSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Read rewards overview data
  const { data: rewardsOverview } = useReadContract({
    address: POLKING_ADDRESS,
    abi: rewardsAbi,
    functionName: "getRewardsdOverviewData",
    args: isConnected && address ? [address] : undefined,
  })

  // Read live rewards data
  const { data: liveRewardsData } = useReadContract({
    address: POLKING_ADDRESS,
    abi: rewardsAbi,
    functionName: "getLiveRewardData",
    args: isConnected && address ? [address] : undefined,
  })

  // Update user totals when contract data changes
  useEffect(() => {
    if (!isConnected || !address || !rewardsOverview) {
      setUserTotals({
        totalPassiveRewards: 0,
        totalActiveRewards: 0,
        totalClaimedPOL: 0,
        totalClaimedPK: 0,
      });
      return;
    }

    const [passiveRewards, activeRewards, maticPaid, pkPaid] = rewardsOverview;

    setUserTotals({
      totalPassiveRewards: Number(formatEther(passiveRewards)),
      totalActiveRewards: Number(formatEther(activeRewards)),
      totalClaimedPOL: Number(formatEther(maticPaid)),
      totalClaimedPK: Number(formatEther(pkPaid)),
    });
  }, [isConnected, address, rewardsOverview]);

  // Update live rewards
  useEffect(() => {
    if (!isConnected || !address || !liveRewardsData) {
      setLiveRewards(0);
      setRewardsPerSecond(0);
      springValue.set(0);
      displayValue.set("0.0000");
      return;
    }

    const [totalUnclaimed, rewardsRate] = liveRewardsData;
    const unclaimedValue = Number(formatEther(totalUnclaimed));
    const rewardsRateValue = Number(formatEther(rewardsRate));

    setLiveRewards(unclaimedValue);
    setRewardsPerSecond(rewardsRateValue);
    springValue.set(unclaimedValue);
    displayValue.set(unclaimedValue.toFixed(4));

    // Start counting up
    const updateRewards = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = now;

      setLiveRewards(prev => {
        const newValue = prev + (rewardsRateValue * deltaTime);
        springValue.set(newValue);
        displayValue.set(newValue.toFixed(4));
        return newValue;
      });
    };

    const animationFrame = requestAnimationFrame(function animate() {
      updateRewards();
      requestAnimationFrame(animate);
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [isConnected, address, liveRewardsData]);

  // Update claim rewards handler
  const handleClaimRewards = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet.")
      openWalletModal()
      return
    }

    try {
      await claimRewards()
      toast.success("Claim transaction submitted!")
    } catch (error) {
      console.error("Claim error:", error)
      toast.error("Failed to claim rewards. Please try again.")
    }
  }

  // Handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      toast.success("Rewards claimed successfully!")
      setLiveRewards(0)
      springValue.set(0)
      displayValue.set("0.0000")
    }
  }, [isTransactionSuccess])

  return (
    <section className="relative py-16 sm:py-20 bg-gradient-to-br from-[#0a0118] via-[#120630] to-[#0e0424] text-white px-4 sm:px-6 md:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 z-0">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(165,138,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(165,138,248,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Blurred shapes */}
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-[#a58af8]/10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[25vw] h-[25vw] rounded-full bg-[#facc15]/10 blur-[60px]" />

        {/* Animated elements */}
        <motion.div
          animate={{
            x: ["-5%", "5%"],
            y: ["-3%", "3%"],
          }}
          transition={{
            x: { duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
            y: { duration: 15, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
          }}
          className="absolute top-[30%] left-[20%] w-[20vw] h-[20vw] rounded-full bg-[#a58af8]/5 blur-[80px]"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 text-center"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 relative inline-block">
            <span className="text-gradient-gold">Rewards Overview</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Stay updated with your real-time earnings and claimed rewards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl p-5 sm:p-6 backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)]"
        >
          {/* Stats Grid - 2x2 layout with equal heights */}
          <div className="grid grid-cols-2 gap-3 mb-5 mt-1">
            {/* Passive Rewards */}
            <div className="bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 transition-all duration-300 hover:border-[#a58af8]/40 hover:shadow-[0_0_15px_rgba(165,138,248,0.2)]">
              <p className="text-white/60 text-xs mb-1">Total Passive Rewards</p>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-sm font-bold text-white">{userTotals.totalPassiveRewards} POL</p>
              </div>
            </div>

            {/* Active Rewards */}
            <div className="bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 transition-all duration-300 hover:border-[#a58af8]/40 hover:shadow-[0_0_15px_rgba(165,138,248,0.2)]">
              <p className="text-white/60 text-xs mb-1">Total Active Rewards</p>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-sm font-bold text-white">{userTotals.totalActiveRewards} POL</p>
              </div>
            </div>

            {/* Total Claimed POL */}
            <div className="bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 transition-all duration-300 hover:border-[#a58af8]/40 hover:shadow-[0_0_15px_rgba(165,138,248,0.2)]">
              <p className="text-white/60 text-xs mb-1">Total Claimed POL</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-sm font-bold text-[#a58af8]">{userTotals.totalClaimedPOL} POL</p>
              </div>
            </div>

            {/* Total Claimed PK */}
            <div className="bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 transition-all duration-300 hover:border-[#a58af8]/40 hover:shadow-[0_0_15px_rgba(165,138,248,0.2)]">
              <p className="text-white/60 text-xs mb-1">Total Claimed PK</p>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
                <p className="text-sm font-bold text-[#a58af8]">{userTotals.totalClaimedPK} POL</p>
              </div>
            </div>
          </div>

          {/* Live Rewards Section */}
          <div className="bg-[#0f0c1a]/40 rounded-xl p-4 border border-[#a58af8]/30 mb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gauge className="text-[#a58af8] w-5 h-5" />
              <h3 className="text-base font-semibold text-white/80">Live Rewards</h3>
            </div>

            <div className="relative">
              <motion.p className="text-2xl font-bold text-[#a58af8]">
                {displayValue.get()} POL
              </motion.p>
              <div className="absolute -inset-1 bg-[#a58af8]/5 blur-md rounded-full -z-10"></div>
            </div>

            <p className="text-xs text-white/40 mt-1">
              Earning {rewardsPerSecond.toFixed(4)} POL per second
            </p>
          </div>

          {/* Claim Button */}
          <div className="relative group">
            {/* Button glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-500 group-hover:duration-200"></div>

            {/* Main button */}
            <button
              onClick={handleClaimRewards}
              disabled={isClaiming || !isConnected} // Disable while claiming or not connected
              className="relative w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#0f0824] rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15] text-base">
                {isClaiming ? "Claiming..." : !isConnected ? "Connect Wallet to Claim" : "Claim Rewards"}
              </span>

              {/* Animated border line */}
              {!isClaiming && isConnected && (
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#a58af8] to-[#facc15] group-hover:w-[calc(100%-20px)] -translate-x-1/2 transition-all duration-300"></span>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default RewardsOverview
