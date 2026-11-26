# AGENTS.md — SniperMCP Engineering Guide

## Overview
SniperMCP is a non-custodial AI sniper terminal for **Robinhood Chain** (Mainnet `4663` / Testnet `46630`).

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS
- **Web3:** Wagmi + Viem
- **Database:** Neon Serverless Postgres + Drizzle ORM (`@neondatabase/serverless` at runtime, `pg` devDep for `drizzle-kit push`)
- **Market Data:** GeckoTerminal v2 API (`networks/robinhood`)

## Key Paths
- `src/app/page.tsx` — Editorial landing page
- `src/app/docs/page.tsx` — Documentation & network parameters
- `src/app/terminal/page.tsx` — Main 3-column trading terminal (persists rules per wallet)
- `src/db/schema.ts` — `sniper_rules` and `positions` tables
- `src/db/index.ts` — Neon HTTP Drizzle client
- `src/app/api/radar/route.ts` — Live Robinhood Chain pool aggregator
- `src/app/api/parse-rule/route.ts` — Natural-language rule compiler
- `src/app/api/simulate/route.ts` — Pre-flight bytecode/gas simulator
- `src/app/api/rules/route.ts` — Rules CRUD
- `src/app/api/positions/route.ts` — Positions CRUD

## Commands
- `npm run dev` — Local development server
- `npm run build` — Production build + TypeScript check
- `npx drizzle-kit push` — Push schema changes to Neon (reads `.env.local`)

## Conventions
- Keep API routes consolidated by resource to minimize serverless function count.
- Maintain the monochrome glassmorphism + emerald accent visual language (`#030504`, `border-white/10`, `emerald-400`).
- Never commit `.env.local` or `CONTEXT.md`.
