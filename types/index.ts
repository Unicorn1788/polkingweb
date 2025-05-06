export interface NavLink {
  name: string
  href: string
  children: { name: string; href: string }[]
}

export interface StakePlan {
  tier: string
  tierRange: string
  duration: string
  maxRewards: string
  bestFor: string
  minAmount: number
  maxAmount: number
}

export interface RoadmapItem {
  quarter: string
  title: string
  description: string
  icon: React.ReactNode
  isCompleted: boolean
}

export interface AnalyticsData {
  scansByDay: Record<string, number>
  totalScans: number
  uniqueScanners: number
  averageScansPerDay: number
}

export interface WalletContextType {
  isConnected: boolean
  openWalletModal: () => void
  closeWalletModal: () => void
  address: string | null
  balance: string | null
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
} 
