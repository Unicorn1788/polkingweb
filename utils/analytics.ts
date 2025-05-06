import { track } from "@vercel/analytics"

export const trackEvent = (name: string, properties?: Record<string, any>) => {
  track(name, properties)
}

export const trackWalletConnect = (walletType: string) => {
  trackEvent("wallet_connect", { walletType })
}

export const trackStaking = (amount: string, poolType: string) => {
  trackEvent("staking", { amount, poolType })
}

export const trackRewardsClaim = (amount: string) => {
  trackEvent("rewards_claim", { amount })
}

export const trackPoolInteraction = (action: string, poolType: string) => {
  trackEvent("pool_interaction", { action, poolType })
} 
