"use client"

import { useState } from "react"
import { ArrowRight, ChevronDown, Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { useTransaction } from "@/context/transaction-context"
import { formatTxHash, getExplorerTxUrl } from "@/utils/transaction"

export default function TransactionCard() {
  const { transactions } = useTransaction()
  const [isExpanded, setIsExpanded] = useState(false)

  // Get the most recent 3 transactions
  const recentTransactions = transactions.slice(0, 3)

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-400" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-white/50" />
    }
  }

  // Get status text color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-amber-400"
      case "success":
        return "text-green-400"
      case "error":
        return "text-red-400"
      default:
        return "text-white/50"
    }
  }

  return (
    <Card className="max-w-md mx-auto" maxHeight={isExpanded ? "none" : "400px"}>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>

      <CardContent scrollable={!isExpanded}>
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.hash}
                className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10 hover:border-[#a58af8]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(tx.status)}
                    <span className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                  <span className="text-xs text-white/50">{formatTime(tx.timestamp)}</span>
                </div>

                <p className="text-sm text-white mb-2">{tx.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">{formatTxHash(tx.hash)}</span>
                  <a
                    href={getExplorerTxUrl(tx.hash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#a58af8] hover:text-[#facc15] transition-colors"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-white/60 mb-2">No transactions yet</p>
            <p className="text-sm text-white/40">Your recent transactions will appear here</p>
          </div>
        )}

        {/* Additional content that might be hidden */}
        {isExpanded && transactions.length > 3 && (
          <div className="mt-4 pt-4 border-t border-[#a58af8]/10">
            <h4 className="text-sm font-medium text-white mb-3">Older Transactions</h4>
            <div className="space-y-3">
              {transactions.slice(3).map((tx) => (
                <div
                  key={tx.hash}
                  className="bg-[#0f0c1a]/50 rounded-xl p-3 border border-[#a58af8]/10 hover:border-[#a58af8]/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <span className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-white/50">{formatTime(tx.timestamp)}</span>
                  </div>

                  <p className="text-sm text-white mb-2">{tx.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{formatTxHash(tx.hash)}</span>
                    <a
                      href={getExplorerTxUrl(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#a58af8] hover:text-[#facc15] transition-colors"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between border-t border-[#a58af8]/20 pt-3">
        {transactions.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
          >
            <span>{isExpanded ? "Show Less" : "Show More"}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>
        )}

        <button
          onClick={() => {
            /* Navigate to transactions page */
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f0c1a] border border-[#a58af8]/30 hover:border-[#a58af8]/60 rounded-lg transition-colors text-[#a58af8] text-sm ml-auto"
        >
          <span>All Transactions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </CardFooter>
    </Card>
  )
}
