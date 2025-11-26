# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tor's Pottery Shop - an auction marketplace for handmade pottery built with Next.js 15, featuring live auctions, gallery browsing, and commission submissions.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase (auth, database, storage), TanStack Query, Zustand, React Hook Form + Zod, Stripe, Framer Motion

## Commands

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build with Turbopack
npm run start    # Start production server
npm run lint     # Run ESLint
```

This is a monorepo - all commands run from root and delegate to the `pottery-auction` workspace.

## Environment Setup

Required in `pottery-auction/.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

## Architecture

### Data Layer (Supabase)

Three client configurations in `src/lib/supabase/`:
- `client.ts` - Browser client using `@supabase/ssr` with `createBrowserClient`
- `server.ts` - Server client for API routes/server components using `createServerClient` with cookie handling
- `admin.ts` - Admin client with service role key to bypass RLS for privileged operations

Database types generated in `database.types.ts`.

### API Layer

REST API routes in `src/app/api/`:
- `/api/auctions` - CRUD for auctions (admin-only for create/update/delete)
- `/api/items` - CRUD for pottery items, plus `/featured` endpoint
- `/api/bids` - Place bids and fetch bid history
- `/api/commissions` - Submit and manage commission requests

API routes check auth via `supabase.auth.getUser()` and admin status via `profiles.is_admin`.

### Data Fetching Pattern

Client-side data fetching uses TanStack Query:
1. API client functions in `src/lib/api-client.ts` wrap fetch calls
2. Query hooks in `src/hooks/queries/` (useAuctions, useItems, useCommissions, useStats) use these clients
3. `QueryProvider` in `src/components/providers/` wraps the app

### State Management

Zustand stores in `src/store/`:
- `auth.ts` - Supabase user session and profile data
- `auction.ts` - Current auction state, pieces, bids, selected piece

Auth flow managed by `useAuth` hook (`src/hooks/useAuth.ts`) which listens to Supabase auth state changes and fetches the profile from the `profiles` table.

### Theming System

`ColorToggleContext` provides three themes: blue, green (default), purple. Access via `useColorToggle()` hook which returns helper functions:
- `getTextColorClass()`, `getBgColorClass()`, `getBorderColorClass()`, etc.

Theme persisted to localStorage. Custom animations in Tailwind config: `pottery-wheel`, `gentle-bounce`, `fade-in`, `slide-up`.

### Types

Core entities in `src/types/index.ts`:
- `User`, `Item`, `Auction`, `Bid`, `Commission`, `NotificationPreferences`
- Status enums: `Auction.status` ('upcoming'|'active'|'ended'), `Bid.status` ('pending'|'confirmed'|'outbid'|'won'), `Commission.status` ('submitted'|'reviewing'|'accepted'|'declined'|'in_progress'|'completed')

### Key Pages

- `/` - Homepage with featured pieces
- `/gallery` - Browse all pottery
- `/auctions` - Live and upcoming auctions
- `/commissions` - Submit pottery ideas (includes drawing canvas)
- `/admin` - Admin dashboard for managing content
