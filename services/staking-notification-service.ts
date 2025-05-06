import { useNotifications } from "@/context/notification-context"
import { formatNumber } from "@/utils/format-utils"

// Types for staking notifications
export type StakingEventType =
  | "stake_success"
  | "contract_completion"
  | "capacity_warning"
  | "tier_upgrade"
  | "rewards_available"
  | "stake_error"

interface StakingNotificationOptions {
  amount?: number
  tier?: string
  contractId?: string
  percentageFilled?: number
  estimatedCompletion?: Date
  errorMessage?: string
}

// Service to handle staking notifications
export const useStakingNotifications = () => {
  const { addNotification } = useNotifications()

  // Notification for successful staking
  const notifyStakeSuccess = (options: { amount: number; tier: string }) => {
    addNotification({
      title: "Staking Successful",
      message: `You have successfully staked ${formatNumber(options.amount)} POL in ${options.tier}.`,
      type: "success",
      link: "/dashboard",
    })
  }

  // Notification for rewards available
  const notifyRewardsAvailable = (options: { amount: number }) => {
    addNotification({
      title: "Rewards Available",
      message: `You have ${formatNumber(options.amount)} POL rewards available to claim.`,
      type: "success",
      link: "/rewards",
    })
  }

  // Notification for staking errors
  const notifyStakeError = (options: { errorMessage: string }) => {
    addNotification({
      title: "Staking Error",
      message: options.errorMessage,
      type: "error",
    })
  }

  // Notification for tier upgrade opportunity
  const notifyTierUpgrade = (options: { currentTier: string; nextTier: string; amountNeeded: number }) => {
    addNotification({
      title: "Tier Upgrade Available",
      message: `Add ${formatNumber(options.amountNeeded)} more POL to upgrade from ${options.currentTier} to ${options.nextTier}.`,
      type: "info",
      link: "/stake",
    })
  }

  return {
    notifyStakeSuccess,
    notifyRewardsAvailable,
    notifyStakeError,
    notifyTierUpgrade,
  }
}
