"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Globe2, Shield, Users, TrendingUp, Clock } from "lucide-react"
import { useContractRead } from "wagmi"
import { POLKING_ADDRESS } from "@/lib/wagmi-config"
import { formatEther, type Address } from "viem"
import POLKING_ABI from "@/app/contracts/POLKING.json"

// Define return type for getRankCounts
type RankCounts = {
  soldiers: bigint
  knights: bigint
  dukes: bigint
  kings: bigint
}

export default function GlobalPoolSection() {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  // Get total rank pools amount
  const { data: totalRankPools } = useContractRead({
    address: POLKING_ADDRESS,
    abi: POLKING_ABI,
    functionName: 'getTotalRankPools',
  }) as { data: bigint | undefined }

  // Get rank counts
  const { data: rankCounts } = useContractRead({
    address: POLKING_ADDRESS,
    abi: POLKING_ABI,
    functionName: 'getRankCounts',
  }) as { data: RankCounts | undefined }

  // Format number with spaces
  const formatNumber = (num: bigint | number | null | undefined) => {
    if (!num) return "0"
    return formatEther(BigInt(num.toString())).replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  }

  // Calculate pool amounts based on percentages
  const calculatePoolAmount = (percentage: number) => {
    if (!totalRankPools) return "0"
    const amount = (totalRankPools * BigInt(percentage)) / BigInt(100)
    return formatNumber(amount)
  }

  useEffect(() => {
    // Set next distribution to be next Saturday at 11:00 UTC
    const now = new Date()
    const nextDistribution = new Date()
    
    // Set to next Saturday
    const daysUntilSaturday = (6 - now.getUTCDay() + 7) % 7
    nextDistribution.setUTCDate(now.getUTCDate() + daysUntilSaturday)
    
    // Set time to 11:00 UTC
    nextDistribution.setUTCHours(11, 0, 0, 0)

    // If it's already past 11:00 UTC on Saturday, set to next Saturday
    if (now.getUTCDay() === 6 && now.getUTCHours() >= 11) {
      nextDistribution.setUTCDate(nextDistribution.getUTCDate() + 7)
    }

    const timer = setInterval(() => {
      const currentTime = new Date()
      const difference = nextDistribution.getTime() - currentTime.getTime()

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Updated pool data with the four rank tiers
  const poolData = {
    totalAmount: formatNumber(totalRankPools),
    distribution: [
      {
        rank: "Soldier",
        percentage: 10,
        description: "Share among Soldier NFT holders",
        color: "from-[#a58af8] to-[#facc15]",
        borderColor: "border-[#a58af8]/30",
        iconColor: "text-[#a58af8]",
        holders: rankCounts ? Number(rankCounts.soldiers) : 0,
        poolAmount: calculatePoolAmount(10)
      },
      {
        rank: "Knight",
        percentage: 20,
        description: "Share among Knight NFT holders",
        color: "from-[#a58af8] to-[#facc15]",
        borderColor: "border-[#a58af8]/30",
        iconColor: "text-[#a58af8]",
        holders: rankCounts ? Number(rankCounts.knights) : 0,
        poolAmount: calculatePoolAmount(20)
      },
      {
        rank: "Duke",
        percentage: 30,
        description: "Share among Duke NFT holders",
        color: "from-[#a58af8] to-[#facc15]",
        borderColor: "border-[#a58af8]/30",
        iconColor: "text-[#a58af8]",
        holders: rankCounts ? Number(rankCounts.dukes) : 0,
        poolAmount: calculatePoolAmount(30)
      },
      {
        rank: "King",
        percentage: 40,
        description: "Share among King NFT holders",
        color: "from-[#a58af8] to-[#facc15]",
        borderColor: "border-[#a58af8]/30",
        iconColor: "text-[#a58af8]",
        holders: rankCounts ? Number(rankCounts.kings) : 0,
        poolAmount: calculatePoolAmount(40)
      },
    ],
  }

  return (
    <section className="relative py-20 overflow-hidden">
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

        {/* Connecting gradient lines */}
        <div className="absolute inset-0">
          {/* Top connecting line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a58af8]/30 to-transparent" />
          
          {/* Bottom connecting line */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#a58af8]/30 to-transparent" />
          
          {/* Left connecting line */}
          <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-[#a58af8]/30 to-transparent" />
          
          {/* Right connecting line */}
          <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-[#a58af8]/30 to-transparent" />
        </div>

        {/* Animated corner accents */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#a58af8]/20 to-transparent"
        />
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#facc15]/20 to-transparent"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold mb-4 relative inline-block"
          >
            <span className="text-gradient-gold">Global Staking Pool</span>
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 blur-xl bg-gradient-to-r from-[#a58af8]/20 via-[#facc15]/20 to-[#a58af8]/20 rounded-full"
            />
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-white/70 text-sm"
          >
            Our global staking pool is distributed among all ranks. Higher ranks receive a larger share of the pool.
          </motion.p>
        </div>

        {/* Total Global Pool Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#0f0c1a]/50 backdrop-blur-sm border border-[#a58af8] rounded-2xl p-6 shadow-[0_0_15px_rgba(165,138,248,0.3)] mb-8 w-full relative overflow-hidden"
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 border border-[#a58af8] rounded-2xl"
            animate={{
              boxShadow: [
                "0 0 5px rgba(165,138,248,0.3)",
                "0 0 20px rgba(165,138,248,0.5)",
                "0 0 5px rgba(165,138,248,0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="flex flex-col items-center justify-center relative z-10">
            <h3 className="text-xl font-medium text-white mb-2">Total Global Pool</h3>
            <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#a58af8] to-[#facc15] text-transparent bg-clip-text">
              {poolData.totalAmount} POL
            </p>
            <p className="text-white/60 text-sm mt-2">Updated daily based on staking activity</p>
          </div>
        </motion.div>

        {/* Next Distribution Countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-[#0f0c1a]/50 backdrop-blur-sm border border-[#a58af8] rounded-2xl p-6 shadow-[0_0_15px_rgba(165,138,248,0.3)] mb-8 w-full relative overflow-hidden"
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute inset-0 border border-[#a58af8] rounded-2xl"
            animate={{
              boxShadow: [
                "0 0 5px rgba(165,138,248,0.3)",
                "0 0 20px rgba(165,138,248,0.5)",
                "0 0 5px rgba(165,138,248,0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="flex flex-col items-center justify-center relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-[#a58af8]" />
              <h3 className="text-xl font-medium text-white">Next Distribution</h3>
            </div>
            <p className="text-sm text-white/60 mb-4">Every Saturday at 11:00 UTC</p>
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <motion.span
                  key={timeLeft.days}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-white"
                >
                  {timeLeft.days}
                </motion.span>
                <span className="text-xs text-white/60">Days</span>
              </div>
              <div className="flex flex-col items-center">
                <motion.span
                  key={timeLeft.hours}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-white"
                >
                  {timeLeft.hours}
                </motion.span>
                <span className="text-xs text-white/60">Hours</span>
              </div>
              <div className="flex flex-col items-center">
                <motion.span
                  key={timeLeft.minutes}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-white"
                >
                  {timeLeft.minutes}
                </motion.span>
                <span className="text-xs text-white/60">Minutes</span>
              </div>
              <div className="flex flex-col items-center">
                <motion.span
                  key={timeLeft.seconds}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-2xl font-bold text-white"
                >
                  {timeLeft.seconds}
                </motion.span>
                <span className="text-xs text-white/60">Seconds</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toggle for Rank Pool Breakdown */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-300 ${
              showBreakdown
                ? "bg-gradient-to-r from-[#a58af8] to-[#facc15] shadow-[0_0_15px_rgba(165,138,248,0.3)]"
                : "bg-[#0f0c1a]/70 border border-[#a58af8]/20 hover:border-[#a58af8]/40 hover:shadow-[0_0_10px_rgba(165,138,248,0.2)]"
            }`}
          >
            <span>{showBreakdown ? "Hide" : "Show"} Rank Pool Breakdown</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showBreakdown ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Rank Pool Breakdown - Redesigned */}
        <AnimatePresence>
          {showBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[800px] overflow-y-auto">
                {poolData.distribution.map((item) => (
                  <motion.div
                    key={item.rank}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`bg-[#0f0c1a]/50 backdrop-blur-sm border ${item.borderColor} rounded-xl overflow-hidden shadow-lg`}
                  >
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${item.color} p-4 relative`}>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,white_0%,transparent_80%)]" />
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0f0c1a]/70 border border-white/20 flex items-center justify-center">
                          <Shield className={`w-5 h-5 ${item.iconColor}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{item.rank} Pool</h3>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      {/* Percentage */}
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Allocation:</span>
                        <span className="text-lg font-bold text-white">{item.percentage}% of total pool</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#0a0118] rounded-full h-3 mb-2">
                        <div
                          className={`bg-gradient-to-r ${item.color} h-3 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        >
                          <div className="w-full h-full bg-white/10"></div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-white/70">{item.description}</p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div className="bg-[#0a0118]/70 rounded-lg p-3 border border-[#a58af8]/10">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Users className="w-3.5 h-3.5 text-[#a58af8]" />
                            <p className="text-white/80 text-xs">NFT Holders</p>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {item.holders}
                          </p>
                        </div>

                        <div className="bg-[#0a0118]/70 rounded-lg p-3 border border-[#a58af8]/10">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-[#a58af8]" />
                            <p className="text-white/80 text-xs">Pool Amount</p>
                          </div>
                          <p className="text-sm font-semibold text-[#facc15]">
                            {item.poolAmount} POL
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
