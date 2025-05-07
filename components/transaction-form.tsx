"use client"

import { useState } from "react"
import { useAppKit } from '@reown/appkit/react'
import { useAppKitAccount } from '@reown/appkit/react'
import { motion } from "framer-motion"
import { useToast } from "@/context/toast-context"
import { CONTRACT_ADDRESS } from "@/lib/constants"
import { getStakingPlan, stakePOL } from "@/lib/wagmi-config"
import type { Address } from "viem"

export function TransactionForm() {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isConnected || !address) {
      open()
      return
    }

    try {
      setIsLoading(true)
      const plan = await getStakingPlan(Number(amount))
      if (!plan) {
        throw new Error("Failed to get staking plan")
      }

      const tx = await stakePOL(Number(amount), address as Address)
      showToast({
        type: "success",
        title: "Success",
        message: "Successfully staked POL tokens"
      })
      setAmount("")
    } catch (error) {
      console.error("Staking error:", error)
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to stake POL tokens. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto"
    >
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
          Amount to Stake
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in POL"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
          min="0"
          step="0.01"
        />
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading || !amount}
        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Processing..." : "Stake POL"}
      </motion.button>
    </motion.form>
  )
}
