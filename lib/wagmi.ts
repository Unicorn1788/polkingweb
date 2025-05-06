import { createConfig } from "wagmi"
import { polygon } from "wagmi/chains"
import { InjectedConnector } from "wagmi/connectors/injected"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"

// Get WalletConnect project ID from environment variable
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || ""

// Create a simple transport function instead of using http directly
const createTransport = (url: string | undefined) => {
  return ({ request, chain }: { request: { method: string; params: any[] }; chain?: { id: number } }) => {
    const finalUrl = url || `https://polygon-rpc.com`

    return fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: request.method,
        params: request.params,
      }),
    }).then((res) => res.json())
  }
}

// Create wagmi config
export const config = createConfig({
  chains: [polygon],
  connectors: [
    new InjectedConnector({
      chains: [polygon],
      options: {
        name: "Injected",
        shimDisconnect: true,
      },
    }),
    new WalletConnectConnector({
      chains: [polygon],
      options: {
        projectId: walletConnectProjectId,
        showQrModal: true,
        metadata: {
          name: "Polking Finance",
          description: "Stake like a king. Rise through the ranks. Reign with rewards.",
          url: "https://polking.io",
          icons: ["https://polking.io/images/polking-logo.png"],
        },
      },
    }),
  ],
  transports: {
    [polygon.id]: createTransport(process.env.NEXT_PUBLIC_RPC_POLYGON),
  },
})

// Export the config for use in components
export const wagmiConfig = config
export default config
