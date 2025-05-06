export const POLYGON_CHAIN_ID = 137 // Polygon Mainnet chain ID
export const POLYGON_TESTNET_CHAIN_ID = 80001 // Polygon Mumbai Testnet chain ID

// Maximum decimals to display for token amounts
export const MAX_DISPLAY_DECIMALS = 6

export const POLYGON_RPC_URL = process.env.NEXT_PUBLIC_RPC_POLYGON || "https://polygon-rpc.com"

// Contract addresses
export const STAKING_CONTRACT_ADDRESS = "0xa33813d34Fb7Ba7f905147aa0709E46535ab0C18" // Replace with actual contract address
export const TOKEN_CONTRACT_ADDRESS = "0xa33813d34Fb7Ba7f905147aa0709E46535ab0C18" // Replace with actual POL token address

// Explorer URLs
export const POLYGON_EXPLORER_URL = "https://polygonscan.com"

// App configuration
export const APP_NAME = "Polking"

// WalletConnect project ID - placeholder value, replace with your actual project ID if you have one
export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID"
