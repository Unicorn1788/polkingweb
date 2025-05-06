import { createConfig } from "wagmi"
import { polygon } from "wagmi/chains"

// Create a simple transport function
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

// Create wagmi config with minimal dependencies
export const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: createTransport(process.env.NEXT_PUBLIC_RPC_POLYGON),
  },
})

// Export the config for use in components
export const wagmiConfig = config
export default config
