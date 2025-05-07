"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { config as wagmiConfig } from "@/lib/wagmi-config"
import { WalletProvider } from "@/context/wallet-context"
import { NotificationProvider } from "@/context/notification-context"
import { ToastProvider } from "@/context/toast-context"
import { Notification } from "@/components/ui/notification"
import { WalletModalContainer } from "@/components/wallet-modal-container"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { queryClient } from '@/lib/query-client'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
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
