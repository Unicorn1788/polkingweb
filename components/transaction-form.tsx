"use client"

import type React from "react"
import { useState } from "react"
import { useTransactionNotification } from "@/hooks/use-transaction-notification"
import { useWallet } from "@/context/wallet-context"
import { Loader2, ArrowRight } from "lucide-react"

interface TransactionFormProps {
  className?: string
}

export default function TransactionForm({ className = "" }: TransactionFormProps) {
  const { isConnected, openWalletModal } = useWallet()
  const { isLoading: isTxLoading, sendTransaction } = useTransactionNotification()
  const [amount, setAmount] = useState("")

  // Handle transaction submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      openWalletModal(() => {
        // This will be called after successful connection
        if (amount && !isNaN(Number.parseFloat(amount)) && Number.parseFloat(amount) > 0) {
          sendTransaction(
            async () => {
              // For demo purposes, we'll simulate a transaction with a timeout
              await new Promise((resolve) => setTimeout(resolve, 1000))
              return "0x1234567890123456789012345678901234567890123456789012345678901234" as `0x${string}`
            },
            {
              description: `Send ${amount} MATIC`,
            },
          )
        }
      })
      return
    }

    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      // Show error
      return
    }

    await sendTransaction(
      async () => {
        // This is where you would normally call your contract method
        // For example: const hash = await writeContract({ ... })

        // For demo purposes, we'll simulate a transaction with a timeout
        // and return a fake transaction hash
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Return a fake transaction hash
        return "0x1234567890123456789012345678901234567890123456789012345678901234" as `0x${string}`
      },
      {
        description: `Send ${amount} MATIC`,
      },
    )
  }

  return (
    <div
      className={`rounded-2xl p-5 backdrop-blur-xl bg-gradient-to-br from-black/80 via-[#0f0c1a]/80 to-[#0b0514]/80 border border-[#a58af8] shadow-[0_0_40px_rgba(165,138,248,0.4)] ${className}`}
    >
      <h3 className="text-xl font-bold mb-4 text-white">Send Transaction</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-white/70 mb-2">
            Amount to Send
          </label>
          <div className="relative">
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full px-4 py-3 bg-[#0a0118] border border-[#a58af8]/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#a58af8]/50"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#a58af8]/10 px-2 py-1 rounded text-sm text-[#a58af8]">
              MATIC
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isTxLoading || !amount}
          className={`w-full relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#a58af8] to-[#facc15] rounded-xl text-[#0a0118] font-medium transition-all ${
            isTxLoading || !amount
              ? "opacity-70 cursor-not-allowed"
              : "hover:shadow-[0_0_20px_rgba(165,138,248,0.4)]"
          }`}
        >
          {isTxLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Send Transaction</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
