import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { polygon } from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [polygon]

// Set up metadata for the dApp
export const metadata = {
  name: 'Polking',
  description: 'POLKING - Built with vision, secured by SmartContracts',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://polking.io',
  icons: ['https://polking.io/images/polking-logo.png']
}

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig 
