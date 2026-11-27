---
name: nextjs-storefront
description: Frontend conventions for Next.js App Router, TypeScript, Zod validation, and Go Fiber REST API integration.
---

## Stack & Package Manager
- Use `pnpm` exclusively for scripts and dependency management (never `npm` or `yarn`).
- Framework: Next.js (App Router), TypeScript (strict), Tailwind CSS.

## Backend Integration Boundary
- This frontend is decoupled from Prisma/direct DB access. All data mutations and queries must go through the Go Fiber REST API (`/api/v1/...`).
- Never re-introduce Prisma client calls or legacy server-side DB queries.

## Validation, Forms & Storage
- Validate all form inputs and API payloads using `Zod` schemas.
- Media uploads (products/categories) target Supabase Storage buckets; handle loading and error states cleanly in UI components.
- Ensure admin CMS routes enforce JWT auth checks and handle `401` redirects gracefully.

## Token-Saving Execution Rules
- Never read `node_modules/`, `.next/`, or `pnpm-lock.yaml`.
- Run `pnpm lint` or `pnpm typecheck` (if configured) after multi-file TypeScript refactors to catch type mismatches early.