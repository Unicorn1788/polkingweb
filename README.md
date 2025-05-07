# POLKING - Staking Platform

A modern staking platform built with Next.js, Reown AppKit, and Wagmi for seamless blockchain interactions.

## 🚀 Features

- **Wallet Integration**: Seamless wallet connection using Reown AppKit
- **Staking**: Stake POL tokens with customizable plans
- **NFT Boosting**: Enhanced rewards through NFT staking
- **Affiliate Program**: Earn rewards by referring others
- **Real-time Updates**: Live transaction status and rewards tracking
- **Responsive Design**: Beautiful UI with smooth animations

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Blockchain**: 
  - Reown AppKit for wallet integration
  - Wagmi for contract interactions
  - Polygon Network
- **UI/UX**:
  - Tailwind CSS for styling
  - Framer Motion for animations
  - Lucide Icons
- **State Management**: React Context
- **Type Safety**: TypeScript

## 📁 Project Structure

```
polkingweb/
├── app/                    # Next.js app directory
│   ├── contracts/         # Smart contract ABIs
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── [feature]/        # Feature-specific components
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Core utilities
└── utils/                # Helper functions
```

## 🔑 Key Components

### Core Components

- **WalletCard**: Displays connected wallet info and disconnect option
- **WalletConnectionStatus**: Shows wallet connection state with network validation
- **NFTBoosterSection**: NFT staking interface
- **AffiliateSection**: Affiliate program interface

### Blockchain Integration

- **wagmi-config.ts**: Core blockchain configuration
  - Contract interactions
  - Network setup
  - Transaction handling

### Utilities

- **transaction.ts**: Transaction-related utilities
  - Explorer URL generation
  - Transaction status handling
  - Error parsing

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_RPC_POLYGON=your_polygon_rpc_url
NEXT_PUBLIC_POLKING_ADDRESS=your_contract_address
```

### Network Configuration

- **Mainnet**: Polygon (Chain ID: 137)
- **Testnet**: Mumbai (Chain ID: 80001)

## 🚀 Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Run development server:
   ```bash
   pnpm dev
   ```

## 📝 Contract Functions

### Staking
- `stakePOL`: Stake POL tokens
- `getStakingPlan`: Get staking plan details
- `getPlanRate`: Get plan ROI and duration
- `getUserStakingAmount`: Get user's staked amount
- `getActiveStakesCount`: Get active stakes count

### Rewards
- `claimRewards`: Claim staking rewards
- `getRewardsData`: Get rewards data (unclaimed, rate)

## 🔒 Security

- Environment variables for sensitive data
- Type-safe contract interactions
- Error handling and validation
- Network validation

## 🎨 UI/UX Features

- Responsive design
- Loading states
- Error handling
- Toast notifications
- Smooth animations
- Network status indicators

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
