# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a pottery auction marketplace built with Next.js 15, featuring:
- **Next.js App Router** with TypeScript
- **Tailwind CSS** for styling with custom theme system
- **Firebase** for authentication and data storage
- **Zustand** for global state management
- **React Hook Form + Zod** for form validation
- **Stripe** integration for payments
- **TanStack Query** for data fetching

## Commands

### Development
```bash
npm run dev          # Start development server with turbopack
npm run build        # Build for production with turbopack
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Workspace Structure
This is a monorepo with npm workspaces:
- Root commands delegate to `pottery-auction` workspace
- All actual code is in `pottery-auction/` directory

## Architecture

### State Management
- **Zustand stores** in `src/store/`:
  - `auth.ts` - Firebase user and profile state
  - `auction.ts` - Current auction, pieces, and bidding state

### Routing & Pages
- **App Router structure** in `src/app/`:
  - `/` - Homepage with featured pieces
  - `/gallery` - Browse all items
  - `/auctions` - Live and upcoming auctions
  - `/commissions` - Custom request forms
  - `/admin` - Admin dashboard

### Components Organization
- `src/components/layout/` - Header, Footer
- `src/components/ui/` - Reusable UI components (Button, ColorToggle, etc.)
- `src/components/auth/` - Authentication modals
- `src/components/auction/` - Auction-specific components

### Styling System
- **Dynamic theming** via ColorToggleContext with CSS custom properties
- **Custom color palette** with medium-green, cream, and toggle colors
- **Custom animations** for pottery wheel and gentle interactions

### Types
- All TypeScript interfaces defined in `src/types/index.ts`
- Core entities: User, Item, Auction, Bid, Commission

### Key Integrations
- **Firebase Auth** - User authentication and profiles
- **Stripe** - Payment processing for bids
- **React Hook Form** - Form handling with Zod validation