# AlgoNodeRewards

[![CI](https://github.com/cryptomalgo/algonoderewards/actions/workflows/ci.yml/badge.svg)](https://github.com/cryptomalgo/algonoderewards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

[![Follow on X](https://img.shields.io/badge/Follow%20@cryptomalgo-000000?style=flat&logo=x&logoColor=white)](https://x.com/cryptomalgo)

A React application to track and visualize the rewards from running an Algorand node, using [Nodely](https://nodely.io/) API.

## Website

You can access the website at [algonoderewards.com](algonoderewards.com)

![app screenshot](screenshot.png)

## Features

- Rewards statistics
  Total rewards

  - Total blocks
  - Max blocks/rewards in a day
  - Min/max reward
  - Average rewards per day/month total/last 30D/last 7D
  - Average blocks per day/month total/last 30D/last 7D
  - Monthly heatmap statistics
  - Rewards History chart
  - Blocks History chart
  - Block Distribution chart by Day and Hour

- Responsive design for both desktop and mobile
- Dark/light/system theme modes
- Real-time exchange rate in USD (from Binance)
- CSV export

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Lint & test
npm run ci

# Build for production
npm run build
```

## Deploy

The project is automatically deployed to [![Deployed on Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=flat&logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)
on each push to the main branch. The production website is available at [algonoderewards.com](https://algonoderewards.com).

## License

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
