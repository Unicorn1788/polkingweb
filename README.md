# Polking - Stake, Earn, Rule

A modern staking platform with NFT rewards, referral system, and real-time tracking dashboard.

## Features

- Advanced staking platform with multiple tiers
- NFT rewards and achievements
- Referral system with rewards
- Real-time tracking dashboard
- Global pool distribution
- Mobile-responsive design
- Accessibility features
- Performance optimizations

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- Wagmi (Web3)
- Jest & React Testing Library
- ESLint & Prettier

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/polking.git
cd polking
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file with required environment variables:
```bash
# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# RPC URLs
NEXT_PUBLIC_RPC_POLYGON=your_polygon_rpc_url
```

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Run tests with coverage

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── contracts/      # Smart contract interactions
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # UI components
│   └── wallet/        # Wallet-related components
├── context/           # React context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── public/           # Static assets
├── styles/           # Global styles
├── types/            # TypeScript types
└── utils/            # Helper functions
```

## Wallet Integration

The platform supports multiple wallet providers:
- MetaMask
- WalletConnect
- TokenPocket
- Phantom

Key wallet features:
- Multi-wallet support
- Network switching (Polygon)
- Error handling
- Connection persistence
- Address copying
- Explorer links
- Loading states

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Wagmi](https://wagmi.sh/)
- [Lucide Icons](https://lucide.dev/)
