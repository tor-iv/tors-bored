# Theme Architecture

Three structural themes: **HAND-DRAWN**, **Y2K**, **RECEIPT**. Each shares data, routing, and business logic but completely transforms visuals and in some cases DOM structure.

For per-theme component specs, see:
- `DESIGN_HANDDRAWN.md`
- `DESIGN_Y2K.md`
- `DESIGN_RECEIPT.md`

---

## Two-Layer System

### Layer 1 — CSS Design Tokens

Applied via `data-theme` attribute on `<html>`. Tailwind reads these as CSS var references.

```css
/* globals.css */

[data-theme="handdrawn"] {
  --bg:           #f7f3e8;
  --bg-well:      #ede8d8;
  --ink:          #1b1211;
  --ink-muted:    #3d3028;
  --accent:       #8c6e4b;
  --accent-hover: #7a5e3b;
  --accent-light: #e8d9b5;
  --border:       #c4b89a;
  --error:        #9b3a2c;
  --success:      #5a7a4a;
  --font-display: 'Caveat', cursive;
  --font-body:    'Nunito', sans-serif;
}

[data-theme="y2k"] {
  --bg:           #c0c0c0;
  --bg-well:      #d4d0c8;
  --ink:          #000000;
  --ink-muted:    #444444;
  --accent:       #000080;
  --accent-hover: #0000aa;
  --accent-light: #d0d0ff;
  --border:       #808080;
  --error:        #ff0000;
  --success:      #008000;
  --font-display: 'Comic Sans MS', cursive;
  --font-body:    'Verdana', 'Tahoma', sans-serif;
}

[data-theme="receipt"] {
  --bg:           #f2ede3;
  --bg-well:      #e8e3d6;
  --ink:          #1a1a1a;
  --ink-muted:    #4a4a4a;
  --accent:       #1a1a1a;
  --accent-hover: #000000;
  --accent-light: #e2ddd0;
  --border:       #888888;
  --error:        #cc2200;
  --success:      #006600;
  --font-display: 'IBM Plex Mono', monospace;
  --font-body:    'IBM Plex Mono', monospace;
}
```

### Layer 2 — CVA Component Variants

For components where structure (not just style) differs between themes, use [CVA](https://cva.style):

```ts
// Example: Button
import { cva } from 'class-variance-authority';

export const buttonVariants = cva('base-classes', {
  variants: {
    theme: {
      handdrawn: 'rounded-none border-2 border-[var(--accent)] font-[var(--font-display)]',
      y2k:       'win98-btn',   // 98.css class
      receipt:   'font-mono border-0 bg-transparent',
    },
    intent: {
      primary:   '...',
      secondary: '...',
      ghost:     '...',
    },
  },
});
```

Most components have a `theme` prop that comes from `useTheme()`. A few components (Y2K modals, RECEIPT browse layout) require completely different DOM structures — those use conditional rendering on the theme value, not CVA.

---

## ThemeContext

**Replaces** `ColorToggleContext`.

```ts
// src/contexts/ThemeContext.tsx
export type Theme = 'handdrawn' | 'y2k' | 'receipt';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export function useTheme(): ThemeContextType
```

**Persistence:** cookie named `theme` (not localStorage) so the server can read it.

**On first visit:** no cookie → pick a random theme server-side → set cookie → no flash.

---

## Middleware (SSR Theme Application)

```ts
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const THEMES = ['handdrawn', 'y2k', 'receipt'] as const;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  let theme = request.cookies.get('theme')?.value;
  
  if (!theme || !THEMES.includes(theme as any)) {
    theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    response.cookies.set('theme', theme, { 
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/' 
    });
  }

  // data-theme is applied server-side via layout.tsx reading the cookie
  return response;
}
```

In `layout.tsx`, read the cookie and pass `data-theme` to `<html>`:

```tsx
const theme = (await cookies()).get('theme')?.value ?? 'receipt';
return <html data-theme={theme}>...</html>;
```

Client-side toggle updates cookie immediately and sets `document.documentElement.dataset.theme` without a page reload.

---

## ThemeToggle Widget

A persistent corner element (bottom-right on desktop, bottom-center on mobile). The widget itself renders differently per theme — it's the meta-joke.

| Theme | Toggle Appearance |
|-------|------------------|
| HAND-DRAWN | A small hand-drawn doodle of three paint swatches, slightly wobbly |
| Y2K | A Win98-style dropdown selector: `[THEME ▼]` with a beveled button |
| RECEIPT | `[ SWITCH THEME ]` in bracket-button style, monospace |

All three expose the same UX: click/tap to cycle to the next theme. A tooltip shows the name of the next theme on hover.

---

## Photography Rule

**Full-color photography is always preserved.** The pot is the product; the theme is the frame. No filters, no desaturation, no dithering applied to the photography in any theme.

| Theme | Photo Frame |
|-------|------------|
| HAND-DRAWN | Rough.js SVG border (roughness 1.5), corner flourish doodles |
| Y2K | CSS beveled frame (inset/outset box-shadow), optional "NEW!" badge |
| RECEIPT | Clean 1px solid `#888` rectangle, monospace caption below |

---

## What Gets Shared (Never Themed)

- All data fetching (TanStack Query hooks)
- All API routes (`/api/*`)
- Authentication logic (`useAuth`, Supabase auth)
- Zustand stores (cart, auction state)
- All route files (`page.tsx` files pass data to themed components)
- Business logic (soft-close, reserve checks, bid validation)

---

## File Structure for Themes

```
src/
  contexts/
    ThemeContext.tsx          ← useTheme(), ThemeProvider
  components/
    ui/
      Button.tsx              ← CVA variants for all three themes
      Card.tsx
      Input.tsx
      Modal.tsx
      Toast.tsx
      ThemeToggle.tsx         ← the corner widget
    theme/
      handdrawn/
        RoughBorder.tsx       ← Rough.js wrapper
        SketchbookFlourish.tsx ← corner doodles
        PageFlipTransition.tsx
      y2k/
        Win98Modal.tsx        ← completely different DOM structure
        Marquee.tsx
        CursorTrail.tsx
        VisitorCounter.tsx
      receipt/
        ReceiptDivider.tsx
        PolaroidPhoto.tsx
        DotMatrixPrint.tsx
        ReceiptBrowseLayout.tsx  ← replaces grid
  middleware.ts
```
