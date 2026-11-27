# Ecommerce catalog (Frontend)

Next.js 16 / React 19 storefront and admin dashboard. This repo is the frontend only: data comes from the sibling Go Fiber API at `../Ecommerce-catalog-api` (default `http://localhost:8080/api/v1`). See `AGENTS.md` for contributor details.

## Requirements

- Node.js 20+ and pnpm
- Go Fiber API running

## Setup

1. `pnpm install`
2. Create `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
   ```

3. `pnpm dev` → `http://localhost:3000`

## Features

- Storefront: browse/filter products, product detail with variants, cart persisted with Zustand, recommendations.
- Checkout: address form from `data-address`, shipping selector, Midtrans redirect from the backend.
- Admin (`/login`, `/admin`): products, categories, users, orders. Accounts come from the API; none are seeded here.

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm start` / `pnpm lint`
- No test or typecheck script: `pnpm exec tsc --noEmit --incremental false`

## Notes

- No Prisma DB/seed, Next route handlers, or middleware here; ignore the stale `db:reset` script and legacy `.env` vars.
- `src/app/actions/orders.ts` is stale; use `orderApi` in `src/lib/api.ts`.
- Live Raja Ongkir rates need a `/api/rajaongkir` proxy (not in this repo); district data only covers Kota Bandung.
- Baseline is red: `pnpm lint` reports 11 errors/7 warnings and `pnpm build` fails typecheck at `src/app/actions/orders.ts`.
