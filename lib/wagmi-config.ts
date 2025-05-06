import { createConfig } from "wagmi"
import { polygon } from "wagmi/chains"

// Create a custom transport function
const customTransport = (chainId: number) => {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_POLYGON || "https://polygon-rpc.com"

  return {
    request: async ({ method, params }: { method: string; params: any[] }) => {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method,
          params,
        }),
      })

      const json = await response.json()

      if (json.error) {
        throw new Error(json.error.message || "RPC Error")
      }

      return json.result
    },
  }
}

// Create a wagmi config with the polygon chain
export const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: customTransport(polygon.id),
  },
})

export default config
