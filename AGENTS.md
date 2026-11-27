<!-- BEGIN:nextjs-agent-rules -->
# Next.js version

Next.js 16.2.2 / React 19 App Router. This is NOT older Next.js: before changing routing, caching, params, images, or effects, read the matching guide in `node_modules/next/dist/docs/01-app/` (`node_modules/next/dist/docs/index.md` has version-specific hints).
<!-- END:nextjs-agent-rules -->

## Source of truth

- README/FEATURES/TECHSTACK and many `.env` comments describe the old Prisma/Next-route-handler app. Current code is a client for the sibling Go Fiber API `../Ecommerce-catalog-api` (default `http://localhost:8080/api/v1`). Trust `src/lib/api.ts`, `next.config.ts`, `package.json`.
- Convention source: `.opencode/skills/nextjs-storefront/SKILL.md` — pnpm only, all data via REST, Zod validation, Supabase uploads, 401 redirects. For routine exploration skip `node_modules/`, `.next/`, `pnpm-lock.yaml` (`.ignore`); open only the specific Next doc named above when needed.
- `prisma.config.ts` and `db:reset`/seed scripts remain, but `prisma/`, `src/lib/prisma.ts`, `src/lib/nodemailer.ts`, `src/app/api/`, and `src/middleware.ts` do not. `src/app/actions/orders.ts` is stale (imports missing modules); use `orderApi` in `src/lib/api.ts`.
- Auth: login writes JWT to `localStorage` + a client-set `token` cookie; `src/lib/auth.ts` only decodes that cookie (no signature check) and allows `ADMIN`/`SUPERUSER`; the guard is `src/app/admin/layout.tsx`.

## Commands

- Use pnpm: `pnpm install`, `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm exec eslint <file>`. `pnpm-lock.yaml` + `pnpm-workspace.yaml` (`allowBuilds` only, not packages) are maintained; ignore stale `package.lock.json`.
- No test or `typecheck` script: use `pnpm exec tsc --noEmit --incremental false`.
- Baseline is red: `pnpm lint` => 11 errors/7 warnings; `pnpm exec tsc --noEmit` => missing modules, stale `src/data/products.ts`, `Header.tsx` nullability, undefined `ShoppingBag`; `pnpm build` compiles then fails at `src/app/actions/orders.ts`. Don't bulk-fix unrelated files.
- Focused verification after edits: run `pnpm exec eslint <changed files>` and `pnpm exec tsc --noEmit --incremental false`; compare against the baseline above.

## Wiring quirks

- All backend calls go through `apiFetch` (`src/lib/api.ts`): `BASE_URL` from `NEXT_PUBLIC_API_URL` with trailing slashes trimmed; it sends a Bearer token from `localStorage`, unwraps `{ data }` by default (`unwrapData: false` for raw Go responses), validates with `schema`, and omits `Content-Type` for `FormData`.
- `.env.local` overrides `.env`; `NEXT_PUBLIC_API_URL` is the only app-specific env var read in `src/` (besides `NODE_ENV`) and also feeds `next.config.ts` `/uploads/**` remote images. Midtrans/Raja Ongkir/Supabase/SMTP/Session vars are leftovers from removed code. No DB or seed is needed. Checkout uses `orderApi.create` and redirects to the backend-provided `snapRedirectUrl`.
- Cart is persisted Zustand (`shopping-cart-storage`) behind `src/contexts/CartContext.tsx`; `ReactQueryProvider` sets `staleTime: 60s`, `gcTime: 30m`; `CartProvider` renders nothing until mounted to avoid hydration mismatch.
- `src/services/wilayah.ts` imports root `data-address/` JSON; districts only cover Kota Bandung (`32.73`). `src/services/rajaongkir.ts` calls `/api/rajaongkir`, which has no route handler here, so live shipping rates cannot work until that proxy/API is restored.
