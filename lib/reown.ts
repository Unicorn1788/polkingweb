import { createReownClient } from "@reown/appkit"
import { createWagmiAdapter } from "@reown/appkit-adapter-wagmi"
import { wagmiConfig } from "./wagmi"

// Create Reown client with wagmi adapter
export const reownClient = createReownClient({
  adapter: createWagmiAdapter({
    wagmiConfig,
  }),
  appName: "Polking Finance",
  appIcon: "/images/polking-logo.png",
})

// Export a function to access the client
export function useReownClient() {
  return reownClient
}
