"use client"

import { useAccount, useBalance, useDisconnect } from "wagmi"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { Copy, ExternalLink, LogOut, Wallet } from "lucide-react"
import { useState } from "react"
import { POLYGON_EXPLORER_URL } from "@/lib/constants"
import WalletConnectionStatus from "./wallet-connection-status"

interface WalletInfoCardProps {
  className?: string
}

export default function WalletInfoCard({ className = "" }: WalletInfoCardProps) {
  const { address, isConnected } = useAccount()
  const { data: balance } = useBalance({ address })
  const { disconnect } = useDisconnect()
  const { open } = useWeb3Modal()
  const [copySuccess, setCopySuccess] = useState(false)

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Copy address to clipboard
  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  // View on explorer
  const viewOnExplorer = () => {
    if (address) {
      window.open(`${POLYGON_EXPLORER_URL}/address/${address}`, "_blank")
    }
  }

  if (!isConnected) {
    return (
      <div className={`p-5 rounded-2xl bg-[#0f0c1a]/70 border border-[#a58af8]/20 ${className}`}>
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-16 h-16 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-[#a58af8]/50" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Wallet Not Connected</h3>
          <p className="text-white/60 text-sm mb-4 text-center">
            Connect your wallet to view your balance and account details
          </p>
          <button
            onClick={() => open()}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f0824] border border-[#a58af8]/30 hover:border-[#a58af8]/60 rounded-full transition-all"
          >
            <Wallet className="w-4 h-4 text-[#a58af8]" />
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15]">
              Connect Wallet
            </span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-5 rounded-2xl bg-[#0f0c1a]/70 border border-[#a58af8]/20 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-white">Wallet Info</h3>
        <WalletConnectionStatus />
      </div>

      <div className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10 mb-4">
        <p className="text-xs text-white/50 mb-1">Connected Address</p>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">{formatAddress(address || "")}</p>
          <div className="flex gap-1">
            <button
              onClick={copyAddress}
              className="p-1.5 rounded-lg bg-[#0f0c1a] border border-[#a58af8]/20 hover:border-[#a58af8]/40 transition-colors"
              title="Copy address"
            >
              <Copy className="w-3.5 h-3.5 text-white/70" />
            </button>
            <button
              onClick={viewOnExplorer}
              className="p-1.5 rounded-lg bg-[#0f0c1a] border border-[#a58af8]/20 hover:border-[#a58af8]/40 transition-colors"
              title="View on explorer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>
        </div>
        {copySuccess && <p className="text-xs text-green-400 mt-1">Address copied to clipboard!</p>}
      </div>

      <div className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10 mb-4">
        <p className="text-xs text-white/50 mb-1">Balance</p>
        <p className="text-sm font-medium text-white">
          {balance ? `${Number.parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : "Loading..."}
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => open({ view: "Networks" })}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0f0c1a] border border-[#a58af8]/20 hover:border-[#a58af8]/40 rounded-lg transition-colors mr-2"
        >
          <span className="text-sm text-white/80">Switch Network</span>
        </button>

        <button
          onClick={() => disconnect()}
          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0f0c1a] border border-red-400/30 hover:border-red-400/60 rounded-lg transition-colors text-red-400"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-sm">Disconnect</span>
        </button>
      </div>
    </div>
  )
}
