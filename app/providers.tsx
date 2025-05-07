"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createAppKit } from '@reown/appkit/react'
import { polygon } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { createStorage, cookieStorage } from 'wagmi'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { NotificationProvider } from "@/context/notification-context"
import { ToastProvider } from "@/context/toast-context"
import { Notification } from "@/components/ui/notification"
import { WalletModalContainer } from "@/components/wallet-modal-container"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { WalletProvider } from "@/context/wallet-context"

// Set up queryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Create Wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId,
  networks: [polygon]
})

// Create the AppKit instance
const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [polygon],
  defaultNetwork: polygon,
  metadata: undefined,
  features: {
    analytics: true,
    email: false,
    socials: false,
    emailShowWallets: false,
    swaps: false
  },
  allWallets: "SHOW"
})

interface ProvidersProps {
  children: ReactNode
  cookies?: string | null
}

export function Providers({ children, cookies }: ProvidersProps) {
  const initialState = React.useMemo(() => {
    if (!cookies) return undefined
    try {
      return cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
    } catch (error) {
      console.error('Failed to parse cookie state:', error)
      return undefined
    }
  }, [cookies])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <ToastProvider>
            <WalletProvider>
              {children}
              <Notification />
              <WalletModalContainer />
              <Analytics />
              <SpeedInsights />
            </WalletProvider>
          </ToastProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
