"use client"

import { useState } from "react"
import { useWallet } from "@/context/wallet-context"
import { Wallet, Copy, ExternalLink, LogOut, Save, ChevronDown } from "lucide-react"
import { POLYGON_EXPLORER_URL } from "@/lib/constants"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import WalletConnectionStatus from "@/components/wallet-connection-status"

export default function WalletCard() {
  const { address, disconnect, isConnected, isPersistenceEnabled, togglePersistence, openWalletModal } = useWallet()
  const [copySuccess, setCopySuccess] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-[#0f0c1a] border border-[#a58af8]/30 flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-[#a58af8]/50" />
          </div>
          <CardTitle className="mb-2">Wallet Not Connected</CardTitle>
          <p className="text-white/60 text-sm mb-6 text-center">
            Connect your wallet to view your balance and account details
          </p>
          <button
            onClick={() => openWalletModal()}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0f0824] border border-[#a58af8]/30 hover:border-[#a58af8]/60 rounded-xl transition-all"
          >
            <Wallet className="w-4 h-4 text-[#a58af8]" />
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#a58af8] to-[#facc15]">
              Connect Wallet
            </span>
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto" maxHeight={isExpanded ? "none" : "400px"}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Wallet Info</CardTitle>
        <WalletConnectionStatus />
      </CardHeader>

      <CardContent className={!isExpanded ? "max-h-[300px] overflow-y-auto" : ""}>
        <div className="space-y-4">
          {/* Address Section */}
          <div className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10">
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

          {/* Network Info */}
          <div className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10">
            <p className="text-xs text-white/50 mb-1">Network</p>
            <p className="text-sm font-medium text-white">Polygon Mainnet</p>
          </div>

          {/* Persistence toggle */}
          <div className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4 text-[#a58af8]" />
                <p className="text-sm text-white">Remember Connection</p>
              </div>
              <button
                onClick={togglePersistence}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isPersistenceEnabled ? "bg-[#a58af8]" : "bg-[#0f0c1a] border border-[#a58af8]/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    isPersistenceEnabled ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Additional content that might be hidden */}
          <div className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10">
            <p className="text-xs text-white/50 mb-1">Wallet Type</p>
            <p className="text-sm font-medium text-white">MetaMask</p>
          </div>

          <div className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10">
            <p className="text-xs text-white/50 mb-1">Connection Status</p>
            <p className="text-sm font-medium text-green-400">Active</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between border-t border-[#a58af8]/20 pt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <span>{isExpanded ? "Show Less" : "Show More"}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        <button
          onClick={() => disconnect()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f0c1a] border border-red-400/30 hover:border-red-400/60 rounded-lg transition-colors text-red-400 text-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Disconnect</span>
        </button>
      </CardFooter>
    </Card>
  )
}
