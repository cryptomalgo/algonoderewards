# AlgoNodeRewards - GitHub Copilot Instructions

## General Guidelines

### Code Organization

- Never create README or documentation files unless specifically asked
- Split large files into smaller, focused modules
- Break down complex files into separate files with specific functions to improve readability and maintainability
- Keep functions small and single-purpose
- Extract reusable logic into separate utilities or hooks

### Development Practices

- Implement changes directly rather than just suggesting them
- Write tests for new functionality
- Ensure TypeScript types are properly defined
- Follow existing code patterns and conventions in the codebase

### Loading States

- **Use Skeleton components for loading states** - NOT Spinner components
- Skeleton component is located at `src/components/ui/skeleton.tsx`
- Create custom fallback components that match the structure of the content being loaded
- Examples in `src/components/address/address-view.tsx`:
  - `StatsFallback` - Mimics stats panel layout with skeleton placeholders
  - `HeatmapFallback` - Shows skeleton grid matching heatmap structure
  - `ChartFallback` - Displays skeleton for chart containers
- Use `<Skeleton className="h-4 w-32" />` with specific height/width classes
- Wrap skeletons in the same container structure as actual content for seamless transitions

### Communication

- Keep responses concise and to the point
- Focus on implementation over explanation
- Only provide detailed explanations when explicitly requested

---

## Project Overview

AlgoNodeRewards is a React-based web application for tracking and visualizing rewards from running an Algorand node. It provides comprehensive statistics, charts, and analytics for node operators using the Nodely API.

**Website**: [algonoderewards.com](https://algonoderewards.com)  
**Repository**: github.com/cryptomalgo/algonoderewards  
**License**: MIT

## Tech Stack

### Core Framework & Build Tools

- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Vite 7.1.10** - Build tool and dev server
- **Vitest 3.2.4** - Unit testing framework

### Routing & State Management

- **TanStack Router 1.133.3** - File-based routing with type safety
  - Routes are in `src/routes/` folder
  - Auto-generated route tree in `src/routeTree.gen.ts`
  - Uses `createFileRoute` for route components
- **TanStack Query 5.90.5** - Server state management and data fetching
  - Queries are organized in `src/hooks/` and `src/queries/`

### UI & Styling

- **Tailwind CSS 4.1.14** - Utility-first CSS framework
  - Configuration in `@tailwindcss/vite` plugin
  - Custom CSS in `src/App.css` with CSS variables for theming
  - Dark/light/system theme support via `next-themes`
- **shadcn/ui** - Component library (New York style)
  - Components in `src/components/ui/`
  - Configuration in `components.json`
  - Uses Radix UI primitives
  - Lucide React for icons
  - `class-variance-authority` for component variants
  - `tailwind-merge` and `clsx` for className composition

### Radix UI Components

- Dialog, Dropdown Menu, Checkbox, Label, Popover, Select, Slider, Toggle, Toggle Group, Tooltip

### Data Visualization

- **Recharts 3.3.0** - Charts and graphs
- **@uiw/react-heat-map 2.3.3** - Heatmap visualization
- **react-gauge-component 1.2.64** - Gauge displays

### Algorand Integration

- **algosdk 3.5.2** - Algorand JavaScript SDK
- **@algorandfoundation/algokit-utils 9.1.2** - Algorand utilities
- Uses Nodely API (mainnet-idx.4160.nodely.dev) for indexer access

### Additional Libraries

- **motion 12.23.24** - Animation library (Framer Motion successor)
- **date-fns 4.1.0** - Date manipulation
- **sonner 2.0.7** - Toast notifications
- **react-error-boundary 6.0.0** - Error handling
- **react-day-picker 9.11** - Calendar/date picker

## Project Structure

```
src/
├── routes/              # TanStack Router file-based routes
│   ├── __root.tsx       # Root layout with header, footer, devtools
│   ├── index.tsx        # Landing page with search
│   ├── $addresses.tsx   # Address rewards view (dynamic route)
│   └── privacy-policy.tsx
│
├── components/          # React components
│   ├── ui/              # shadcn/ui components (Button, Dialog, etc.)
│   ├── address/         # Address-specific components
│   │   ├── charts/      # Reward/block charts and visualizations
│   │   └── stats/       # Statistics panels and boxes
│   ├── heatmap/         # Heatmap components
│   └── [other components]
│
├── hooks/               # Custom React hooks & queries
│   ├── useRewardTransactions.ts  # Fetch block/reward data
│   ├── useAlgoPrice.ts           # Binance price feed
│   ├── useStakeInfo.ts           # Algorand staking info
│   └── [other hooks]
│
├── queries/             # TanStack Query functions
│   ├── getAccountsBlockHeaders.ts
│   └── getResolvedNFD.ts
│
├── lib/                 # Utility functions
│   ├── indexer-client.ts    # Algorand indexer client
│   ├── utils.ts             # General utilities (cn, etc.)
│   ├── date-utils.ts        # Date formatting/manipulation
│   └── csv-export.ts        # CSV export functionality
│
├── constants.ts         # App constants
├── main.tsx            # App entry point
└── App.css             # Global styles & Tailwind config
```

## Key Features

### Rewards & Statistics

- Estimated APY (Annual Percentage Yield)
- Total rewards, blocks, and USD value
- No block probability gauge
- Min/max/average reward calculations
- Daily/weekly/monthly aggregations
- Percentage change indicators

### Visualizations

- Monthly heatmap of rewards/blocks
- Rewards history chart (line chart)
- Blocks history chart (line chart)
- Block distribution by day and hour (bar chart)
- Block reward intervals chart

### User Experience

- Multi-address support (comma or space-separated)
- NFD (Name/Filename Domain) resolution
- Dark/light/system theme modes
- Responsive design (desktop & mobile)
- Real-time ALGO/USD exchange rate
- CSV export with customizable columns
- Address breadcrumb navigation
- Search and filter capabilities

## Coding Guidelines

### Component Patterns

- Use functional components with TypeScript
- Prefer named exports for regular components
- Use `createFileRoute` for route components
- Implement error boundaries for robustness
- Use `@/` alias for imports (configured in Vite)

### Styling Conventions

- Use Tailwind utility classes
- Follow shadcn/ui patterns for components
- Use `cn()` utility from `lib/utils` for conditional classes
- Leverage CSS variables for theming
- Support both light and dark modes

### State Management

- Use TanStack Query for server state
- Custom hooks for complex data fetching logic
- React context for theme management
- URL search params for shareable state (TanStack Router)

### Data Fetching

- Centralize queries in `hooks/` or `queries/`
- Use Algorand indexer client from `lib/indexer-client.ts`
- Handle loading, error, and success states
- Implement proper error boundaries

### Testing

- Use Vitest for unit tests
- Testing Library for React components
- Test files with `.test.ts` or `.test.tsx` extension
- Run tests with `npm test` or `npm run test:watch`

### Code Quality

- ESLint for linting (`npm run lint`)
- Prettier for formatting (`npm run prettier:fix`)
- TypeScript strict mode (`npm run type:check`)
- CI script runs all checks: `npm run ci`

## Deployment

- Automatic deployment to Cloudflare Pages on push to `main` branch
- Production URL: [algonoderewards.com](https://algonoderewards.com)

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run type:check   # TypeScript type checking
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run ci           # Full CI check (lint, format, type, build, test)
```

## Important Notes

### API Usage

- Uses Nodely API for Algorand indexer access (free tier)
- Binance API for real-time ALGO/USD price
- No authentication required

### Address Handling

- Supports multiple addresses (comma or space-separated)
- NFD resolution for friendly names
- Validates Algorand address format
- Type: `ResolvedAddress` in `components/heatmap/types.ts`

### Chart Data

- Block rewards are in microAlgos (divide by 1,000,000 for ALGO)
- Timestamps are in Unix seconds
- Date groupings use `date-fns` with proper timezone handling

### Performance

- React Scan integration for performance monitoring (disabled in prod)
- Lazy loading for dev tools (TanStack Router/Query devtools)
- Auto code-splitting via TanStack Router plugin

## Common Tasks

### Adding a New Route

1. Create file in `src/routes/` (e.g., `about.tsx`)
2. Use `createFileRoute` pattern
3. Route tree auto-generates via TanStack Router plugin

### Adding a New UI Component

1. Use `shadcn/ui` CLI if it's a base component
2. Place in `src/components/ui/` for base components
3. Place in appropriate feature folder for feature components
4. Use `cn()` for className composition

### Adding a New Data Query

1. Create hook in `src/hooks/` or query function in `src/queries/`
2. Use TanStack Query (`useQuery` or `useSuspenseQuery`)
3. Handle loading/error states appropriately
4. Type return data properly

### Styling Guidelines

- Mobile-first responsive design
- Use Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Support dark mode with `dark:` variant
- Follow shadcn/ui component patterns
