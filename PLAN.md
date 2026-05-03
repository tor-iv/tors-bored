# Tor's Pottery — Project Plan

## What This Is

A pottery auction + shop site for one maker (Tor), built with three completely distinct visual themes that users toggle between (or get randomly on first visit). The photography is sacred — themes frame the pots, never compete with them.

**Repo:** `tors-bored` (Bun monorepo, `pottery-auction` workspace)
**Live:** Vercel + Supabase

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Runtime | Bun | All commands via `bun run` |
| Framework | Next.js 15 (App Router) | SSR for theme cookie, RSC for browse |
| Styling | Tailwind CSS v4 | CSS custom properties for theme tokens |
| DB + Auth + Storage + Realtime | Supabase | No separate backend needed |
| Client state | Zustand | Bid state, cart |
| Server state | TanStack Query | Browse data, auction polling |
| Payments | Stripe | Auth-on-bid, capture-on-win |
| Animations | Framer Motion | Page transitions, micro-interactions |
| Icons | Lucide | |
| Theme: HAND-DRAWN | Rough.js + react-rough-fiber | Wobbly borders |
| Theme: Y2K | 98.css | Win98 chrome, scoped to `[data-theme="y2k"]` |

---

## Information Architecture

```
/                       Home — featured piece, active auctions, buy-now grid
/browse                 All pieces (filter: auctions / buy-now / sold)
/auctions               Auction-only browse
/shop                   Buy-now only browse
/piece/[slug]           Individual piece — photos, bid widget or buy-now
/about                  Maker page
/account                Dashboard — active bids, watchlist, won items, orders
/account/orders/[id]    Order detail + tracking
/checkout               Cart + Stripe checkout
/checkout/confirm       Post-purchase confirmation
/admin                  (Private) Listing + auction management
```

---

## Auction Mechanics

| Decision | Choice |
|----------|--------|
| Soft close / anti-snipe | YES — extend 5 min if bid placed in final 2 min |
| Reserve price | YES, hidden — shows "Reserve not met" when below |
| Buyer's premium | NO (MVP) |
| Payment timing | Auth on bid (Stripe PaymentIntent), capture within 24h of win |
| Failed payment (winning bid) | Re-offer to next highest bidder, 48h window |
| Minimum bid increment | Configurable per auction, $5 default |
| Soft-close implementation | Check in bids API route on each new bid; update `auctions.extended_end_date` |

---

## Database Schema

The existing schema (`profiles`, `auctions`, `items`, `bids`, `commissions`) is the foundation. These additions are needed before Phase 1:

```sql
-- Items: listing type + pricing variants
ALTER TABLE items
  ADD COLUMN listing_type TEXT NOT NULL DEFAULT 'auction'
    CHECK (listing_type IN ('auction', 'buy_now')),
  ADD COLUMN sku TEXT UNIQUE,
  ADD COLUMN reserve_price DECIMAL(10,2),
  ADD COLUMN buy_now_price DECIMAL(10,2);

-- Auctions: soft-close configuration
ALTER TABLE auctions
  ADD COLUMN soft_close_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN soft_close_extension_minutes INT DEFAULT 5,
  ADD COLUMN soft_close_window_minutes INT DEFAULT 2,
  ADD COLUMN extended_end_date TIMESTAMPTZ;

-- Profiles: theme preference
ALTER TABLE profiles
  ADD COLUMN theme_preference TEXT
    CHECK (theme_preference IN ('handdrawn', 'y2k', 'receipt'));

-- New: watchlist
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);
```

---

## Phased Build Plan

### MVP — RECEIPT theme only

Goal: a working pottery shop. One theme, fully functional.

- [ ] DB schema additions (migration in `supabase/migrations/`)
- [ ] Replace `ColorToggleContext` with `ThemeContext` (see THEMES.md)
- [ ] RECEIPT theme — all components per DESIGN_RECEIPT.md
- [ ] Soft-close auction mechanics
- [ ] Reserve price display
- [ ] Buy-now listing type + single-item checkout
- [ ] Full Stripe flow: auth on bid → capture on win
- [ ] Auction win → order creation → confirmation page
- [ ] Deploy on Vercel

### v2 — All three themes + polish

- [ ] HAND-DRAWN theme per DESIGN_HANDDRAWN.md
- [ ] Y2K theme per DESIGN_Y2K.md
- [ ] Theme toggle widget (theme-specific rendering per THEMES.md)
- [ ] Supabase Realtime for live bid updates (replace TanStack Query polling)
- [ ] Watchlist (heart button on item cards, `/account` watchlist tab)
- [ ] Email notifications on bid/outbid/win (Resend)
- [ ] Multi-image carousel per piece
- [ ] Real visitor counter for Y2K theme (simple Supabase table)

### v3 — Nice-to-haves

- [ ] Per-pot hand-drawn annotations in HAND-DRAWN theme (CMS annotation editor)
- [ ] AI-generated doodle assets for HAND-DRAWN (build-time Gemini pipeline)
- [ ] Y2K guestbook page (buyer notes, period-correct form)
- [ ] RECEIPT print stylesheet (actual browser print for the receipt)
- [ ] Pieces that don't sell at auction: auto-relist as buy-now option
- [ ] tors-studio portfolio site overhaul (separate repo, after MVP ships)

---

## Deployment

| Service | What | Notes |
|---------|------|-------|
| Vercel | Frontend | Connect `tors-bored` repo, `pottery-auction` as root |
| Supabase | DB + Auth + Storage + Realtime | Managed, free tier covers MVP |
| Stripe | Payments | Test mode for dev, live for production |

**Fix before deploying:** `package.json` root uses `--filter marketplace` but workspace name is `pottery-auction`. Change to `--filter pottery-auction` or rename the workspace to `marketplace`.

---

## Known Risks

| Risk | Mitigation |
|------|-----------|
| Stripe auth-on-bid (PaymentIntent per bid or per user per auction?) | One PaymentIntent per user per auction; update amount as user increases bid. Research before implementing. |
| 98.css global styles bleeding outside Y2K | Import 98.css scoped under `[data-theme="y2k"]` wrapper |
| Rough.js resize perf on mobile | Debounce redraws; fall back to static SVG borders on mobile |
| Soft-close timer accuracy | Vercel cron → `/api/auctions/close-check` every 30s is acceptable for MVP |
| Win98 DOM structure (different markup for Y2K modals) | CVA variants with completely different slot renders; accepted divergence |
