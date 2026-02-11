# Rates Comparison System

Next.js application for comparing shipping rates (FCL, LCL, AIR) with auto-suggest and fingerprint-based deduplication.

## Features

- **Multi-mode rate comparison**: SEA_FCL, SEA_LCL, AIR
- **Auto-suggest inputs**: POL/POD, Airports, Carriers with fuzzy search
- **Draft filter mode**: Type without triggering search until you press "Search"
- **Auto-run controls**: Mode/Base/Sort changes trigger immediate search
- **Fingerprint deduplication**: Prevents duplicate rate imports
- **Excel import**: Smart header detection (skips INSTRUCTIONS rows)
- **Flexible date filtering**: Valid From/To with overlap detection

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router + Turbopack)
- **Database**: Prisma 6.19.2 (SQLite dev, PostgreSQL prod)
- **UI**: React 19.2.3, TailwindCSS 4
- **Excel parsing**: xlsx 0.18.5

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Import Rates

1. Go to `/upload`
2. Upload Excel files with rate data
3. System auto-detects AIR/FCL/LCL based on headers
4. Duplicates are skipped automatically

### Search Rates

1. Go to `/rates`
2. Select mode (FCL/LCL/AIR)
3. Use auto-suggest inputs for fast filtering
4. Press "Search" to apply filters

## Database Schema

Three main models:
- **AirRate**: Air freight rates with weight tiers
- **SeaFclRate**: Full container rates (20GP, 40GP, 40HC, etc.)
- **SeaLclRate**: Less than container rates (W/M, Min Charge, etc.)

All include `fingerprint` field for deduplication.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway deployment guide.

## Learn More

To learn more about Next.js:
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## License

Private project

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
