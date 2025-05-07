"use client"

import { useEffect } from "react"
import { useAppKitAccount } from '@reown/appkit/react'
import { useToast } from "@/context/toast-context"
import { getActiveStakesCount } from "@/lib/wagmi-config"
import type { Address } from "viem"

export function StakingNotificationListener() {
  const { address, isConnected } = useAppKitAccount()
  const { showToast } = useToast()

  useEffect(() => {
    if (!isConnected || !address) return

    const checkStakes = async () => {
      try {
        const count = await getActiveStakesCount(address as Address)
        if (count > 0) {
          showToast({
            type: "success",
            title: "Active Stakes",
            message: `You have ${count} active stake${count > 1 ? 's' : ''}`
          })
        }
      } catch (error) {
        console.error("Error checking stakes:", error)
      }
    }

    checkStakes()
  }, [isConnected, address, showToast])

  return null
}
