# RECEIPT Theme Spec

**Vibe:** Diner bill. Dot-matrix POS terminal. Kitchen ticket. Calm, itemized, weirdly elegant. Each pot is a line item with a SKU. Bidding is "amending the tab." The opposite energy of the other two themes — for buyers who want to actually focus on the pots.

**The photography is sacred.** Full-color Polaroid treatment: the pot lives in a clean rectangle like a photo stapled to the bill.

---

## 1. Fonts

**Primary (everything):** IBM Plex Mono

```bash
# Add to Google Fonts import in layout.tsx
IBM+Plex+Mono:ital,wght@0,400;0,600;0,700
```

**Why IBM Plex Mono over VT323:**
VT323 is a pixel font that breaks down at body text sizes (below 16px it becomes difficult to read). Real diner receipts and POS printers in the 1990s–2000s used narrow proportional dot-matrix fonts that IBM Plex Mono genuinely resembles — legible, professional, with just enough mechanical flavor. VT323 is a display-only novelty; IBM Plex Mono is usable at all sizes.

**Fallback:** `'Courier New', monospace`

```css
[data-theme="receipt"] {
  --font-display: 'IBM Plex Mono', 'Courier New', monospace;
  --font-body:    'IBM Plex Mono', 'Courier New', monospace;
}
```

**Type scale — exactly 3 sizes:**

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| Large | 1.125rem / 18px | 700 | Store name, section headers, TOTAL |
| Medium | 0.875rem / 14px | 400 | Line items, prices, most text |
| Small | 0.6875rem / 11px | 400 | Timestamps, SKUs, footnotes, meta |

No other sizes. Discipline is the aesthetic. If something feels like it needs to be bigger, make it uppercase instead.

**Uppercase rule:** Receipts are often all-caps. Use uppercase for headings, labels, status badges, and button text. Use mixed case for proper names (item titles, descriptions) — all-caps for those would sacrifice readability.

---

## 2. Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#f2ede3` | Page background (thermal receipt paper, slightly yellowed) |
| `--bg-well` | `#e8e3d6` | Alternating line item background, card wells |
| `--ink` | `#1a1a1a` | Primary text (slightly off-black — like ink that's been on paper a while) |
| `--ink-muted` | `#4a4a4a` | Secondary text, SKUs, timestamps, secondary labels |
| `--border` | `#888888` | Dividers, photo frame, button brackets |
| `--accent` | `#1a1a1a` | Interactive elements use the same ink color — no color for actions |
| `--error` | `#cc2200` | ENDING SOON, error states, VOID stamps, reserve not met |
| `--success` | `#006600` | BID CONFIRMED, WON, reserve met |
| `--paper-highlight` | `#f8f4ec` | Lighter than --bg; used for "tape" effect on Polaroid |

**Color philosophy:** This theme uses almost no color. The single accent color is `#cc2200` (receipt printer red), used only for urgency/error states. Everything else is black ink on cream paper. The restraint is the design.

---

## 3. Receipt Layout Grammar

Define these reusable patterns and use them consistently throughout the theme. This is the "receipt language" — every page speaks it.

### Header Block
```
================================
    TOR'S POTTERY STUDIO
    tors-pottery.com
    BROOKLYN, NY
================================
DATE: 2026-05-02    TIME: 14:23
CASHIER: TOR
TICKET #: ORD-2026-0047
================================
```

### Line Item Format
```
{SKU}  {ITEM NAME, ALL CAPS}      {PRICE}
       {descriptor line 2}
```
Example:
```
MUG-2026-014  SODA-FIRED MUG, BLUE GLAZE    $145.00
              WHEEL-THROWN, CONE 10
              CURRENT BID: $95.00
```

Fixed-width layout: SKU in 12 chars, name in ~30 chars, price right-aligned. Use CSS `font-feature-settings: "tnum"` (tabular numbers) on prices to ensure alignment.

### Subtotal Block
```
--------------------------------
SUBTOTAL                 $145.00
SHIPPING                  $12.00
TAX (8.875%)              $14.05
================================
TOTAL DUE:               $171.05
================================
```

### Divider Styles and Rules

| Pattern | CSS class | When to use |
|---------|-----------|-------------|
| `================================` | `.divider-major` | Before/after totals, between major page sections |
| `--------------------------------` | `.divider-minor` | Between line items, sub-sections |
| `* * * * * * * * * * * * * * * *` | `.divider-decorative` | Footer only, before "THANK YOU" |
| `- - - - - - - - - - - - - -` | `.divider-tear` | Perforated tear-off edge at page end / modal bottom |

All dividers are `<div role="separator">` with monospace text content (CSS `overflow: hidden; white-space: nowrap`). Width fills the container.

### Perforated Tear-Off Edge
```css
.receipt-tear {
  position: relative;
  margin: 24px 0;
}
.receipt-tear::before {
  content: '';
  display: block;
  height: 1px;
  background: repeating-linear-gradient(
    to right,
    var(--border) 0,
    var(--border) 6px,
    transparent 6px,
    transparent 12px
  );
}
.receipt-tear::after {
  content: '✂';
  position: absolute;
  left: -16px;
  top: -8px;
  font-size: 14px;
  color: var(--border);
}
```

### Footer Block
```
* * * * * * * * * * * * * * * * *
   THANK YOU FOR YOUR BUSINESS
   ALL SALES FINAL
   HANDMADE WITH CARE IN BROOKLYN
* * * * * * * * * * * * * * * * *
   KEEP YOUR RECEIPT
```

### ASCII Box-Drawing for Sections

Use box-drawing characters for important callout blocks:
```
┌─────────────────────────────┐
│  RESERVE NOT MET            │
│  Current bid is below the   │
│  reserve price.             │
└─────────────────────────────┘
```
Characters: `┌ ─ ┐ │ └ ┘` — works in IBM Plex Mono at all sizes.

---

## 4. Component System

### Buttons

**Primary — bracket style:**
```
[ PLACE BID ]
```
Literal square brackets in IBM Plex Mono. No background fill. On hover: invert — `background: var(--ink); color: var(--bg)`.

```css
.receipt-btn-primary {
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 0;
  background: transparent;
  border: none;
  cursor: pointer;
}
.receipt-btn-primary::before { content: '[ '; }
.receipt-btn-primary::after  { content: ' ]'; }
.receipt-btn-primary:hover {
  background: var(--ink);
  color: var(--bg);
  /* the brackets invert too because they're part of the pseudo-elements */
}
```

**Secondary — angle brackets:**
```
< BACK TO BROWSE >
```
Same treatment, angle brackets.

**Ghost — text with underline dashes:**
```
cancel
------
```

**Disabled:** Append `(UNAVAILABLE)` in muted ink. No style changes needed — the text communicates it.

### Form Inputs

Label above on its own line, input as an underscore field:
```
AMOUNT ($):
___________________
```

```css
.receipt-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--ink);
  font-family: var(--font-display);
  font-size: 0.875rem;
  width: 100%;
  padding: 4px 0;
}
.receipt-input:focus {
  outline: none;
  border-bottom: 2px solid var(--ink);
}
.receipt-input::placeholder {
  color: var(--border);
  font-style: normal;
}
```

### Browse Layout

**NOT a grid.** Browse is a long receipt of all available pieces.

```
================================
    AVAILABLE ITEMS (14)
    SORTED: ENDING SOON
================================
DATE: 2026-05-02    14:23:07

MUG-2026-014  SODA-FIRED MUG         $145.00
              Wheel-thrown, cone 10
              AUCTION  ENDS: 2h 14m
              [WATCH]    [VIEW ITEM]
--------------------------------
MUG-2026-013  WOOD-FIRED BOWL        $220.00
              Anagama kiln, natural ash glaze
              BUY NOW
              [VIEW ITEM]
...
================================
SHOWING: 14 ITEMS
================================
```

Filter controls at top styled as receipt form fields:
```
FILTER BY: [ALL        ▼]
SORT BY:   [ENDING SOON▼]
```

### Individual Piece Page

```
================================
    TOR'S POTTERY STUDIO
================================
TICKET: MUG-2026-014
DATE: 2026-05-02  14:23:07
CASHIER: TOR
================================

[POLAROID PHOTO BLOCK HERE]

================================
ITEM DESCRIPTION
================================
MUG-2026-014  SODA-FIRED MUG
              WHEEL-THROWN
              SODA FIRE, CONE 10
              BLUE ASH GLAZE
              DIMENSIONS: 4" H x 3.5" W
              WEIGHT: 12 OZ
              VOLUME: 12 FL OZ
================================
STARTING BID:             $95.00
CURRENT BID:             $145.00
TIME REMAINING:        2H 14M 07S
BIDS PLACED:                    3
================================
  [ PLACE BID ]    [ WATCH ]
================================

BID HISTORY:
--------------------------------
2026-05-02 14:20:03  BIDDER-4821  $145.00 [CURRENT]
2026-05-02 14:15:44  BIDDER-0293  $120.00 [OUTBID]
2026-05-02 14:01:22  BIDDER-4821   $95.00 [OUTBID]
================================
```

### Cart

A growing receipt that updates as items are added:
```
================================
    YOUR ORDER
================================
MUG-2026-014  SODA-FIRED MUG    $145.00
              (highest bid)
--------------------------------
SUBTOTAL                 $145.00
SHIPPING                  $12.00
TAX                       $14.05
================================
TOTAL DUE:               $171.05
================================
  [ PROCEED TO CHECKOUT ]
  < CONTINUE SHOPPING >
```

### Bid History

Each bid as a receipt line with timestamp and status:
```
BID HISTORY — MUG-2026-014
================================
2026-05-02 14:20:03  BIDDER-4821  $145.00  [CURRENT]
2026-05-02 14:15:44  BIDDER-0293  $120.00  [OUTBID]
2026-05-02 14:01:22  BIDDER-4821   $95.00  [OUTBID]
================================
3 BIDS PLACED
```

Status badges in brackets: `[CURRENT]` in success green, `[OUTBID]` in muted, `[WON]` in bold, `[RESERVE NOT MET]` in error red.

### Modals (Receipt Slips)

A "popup receipt slip" — smaller paper format, centered overlay:
```
.receipt-modal {
  background: var(--bg);
  border: 1px solid var(--border);
  max-width: 360px;
  padding: 24px;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.15);
}
```
Dashed border top (tear-off line) at the top edge. Tear-off divider at bottom.

### Loading State

Dot-matrix print animation — a line of dashes appears character by character, simulating paper feeding through a printer:

```tsx
function ReceiptLoader() {
  return (
    <div className="receipt-loader">
      <div className="receipt-loader-line">LOADING</div>
      <div className="receipt-loader-dots">. . . . . . . . . .</div>
    </div>
  );
}
```
```css
@keyframes dot-print {
  0%   { width: 0; }
  100% { width: 100%; }
}
.receipt-loader-dots {
  overflow: hidden;
  white-space: nowrap;
  animation: dot-print 1.5s steps(10, end) infinite;
}
```

### Empty State

```
================================
    NO ITEMS FOUND
================================
    REGISTER: CLOSED
    QUEUE: EMPTY

    Check back soon.
    New pieces added regularly.
================================
    < RETURN TO HOME >
================================
```

### Error State

```
================================
ERR: TRANSACTION FAILED
================================
CODE:     {errorCode}
MESSAGE:  {errorMessage}
--------------------------------
Please try again or contact:
tor@tors-pottery.com
================================
[ VOID ]       [ TRY AGAIN ]
================================
```

---

## 5. Photography Integration — Polaroid on Receipt

Full-color photo in a clean rectangle, monospace caption below. The pot deserves to be seen clearly.

```tsx
function PolaroidPhoto({ src, alt, sku, description }: Props) {
  return (
    <div className="receipt-polaroid">
      <div className="receipt-polaroid-frame">
        <img src={src} alt={alt} />
      </div>
      <div className="receipt-polaroid-caption">
        <div className="caption-sku">{sku}</div>
        <div className="caption-desc">{description.toUpperCase()}</div>
      </div>
    </div>
  );
}
```

```css
.receipt-polaroid {
  display: inline-block;
  width: 100%;
}
.receipt-polaroid-frame {
  border: 1px solid var(--border);
  padding: 8px;
  background: var(--paper-highlight); /* slight tape/mount effect */
}
.receipt-polaroid-frame img {
  display: block;
  width: 100%;
  height: auto;
}
.receipt-polaroid-caption {
  margin-top: 8px;
  font-family: var(--font-display);
  font-size: 0.6875rem;
  color: var(--ink-muted);
}
.caption-sku {
  font-weight: 600;
  color: var(--ink);
}
```

On the browse receipt list, use a thumbnail version: photo constrained to 80×80px, caption abbreviated to SKU + name only.

---

## 6. Signature Details (exactly 5, committed)

### 1. Dot-Matrix Print Animation for New Bids

When a new bid arrives via Supabase Realtime, the new line "prints" character-by-character:

```tsx
function DotMatrixPrint({ text, onComplete }: Props) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i >= text.length) { clearInterval(interval); onComplete?.(); return; }
      setDisplayed(text.slice(0, ++i));
    }, 30); // 30ms per character — fast enough to feel live, slow enough to see
    return () => clearInterval(interval);
  }, [text]);
  
  return <span className="dot-matrix-printing">{displayed}<span className="cursor">_</span></span>;
}
```

Use this for: new bid lines in bid history, order confirmation text, any "live" data update.

### 2. SKU System

Every item gets a real SKU on creation: `{TYPE}-{YEAR}-{NNN}`

| Type code | Meaning |
|-----------|---------|
| MUG | Mugs (all sizes) |
| BWL | Bowls |
| VAS | Vases |
| PLT | Plates |
| JUG | Jugs / pitchers |
| CUP | Cups (handleless) |
| POT | Pots / casseroles |
| OBJ | Sculptural objects |

Format: `MUG-2026-014` (type code + 4-digit year + 3-digit zero-padded sequence within year and type).

Generate on item creation in the admin API:
```ts
async function generateSku(type: string): Promise<string> {
  const year = new Date().getFullYear();
  const typeCode = SKU_TYPE_CODES[type] ?? 'OBJ';
  const count = await getItemCountForTypeAndYear(typeCode, year);
  return `${typeCode}-${year}-${String(count + 1).padStart(3, '0')}`;
}
```

### 3. Real-Feeling Timestamps on Everything

No relative times ("2 hours ago"). No vague dates. Everything shows ISO-adjacent full timestamps:
```
2026-05-02  14:23:07
```

```ts
function formatReceiptTimestamp(date: Date): string {
  return date.toISOString()
    .replace('T', '  ')
    .slice(0, 21);
}
```

Use everywhere: bid history, order confirmation, item creation date, auction end time.

### 4. Faint Paper Grain Texture

```css
[data-theme="receipt"] body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url(/textures/receipt-paper.svg);
  background-size: 150px;
  background-repeat: repeat;
  opacity: 0.25;
  pointer-events: none;
  z-index: 999;
}
```

The SVG texture is a subtle horizontal stripe pattern (dot-matrix paper has faint horizontal guides). Keep opacity below 0.3 — felt, not seen.

### 5. Receipt Curl Shadow at Page Bottom

The bottom of every "receipt column" (the main content area) has a subtle shadow that makes it look like the paper is curling up:

```css
.receipt-page::after {
  content: '';
  display: block;
  height: 40px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.04) 40%,
    rgba(0, 0, 0, 0.12) 100%
  );
  border-radius: 0 0 4px 4px;
  margin-top: -40px;
  pointer-events: none;
}
```

Combined with a very slight `box-shadow: 0 20px 40px rgba(0,0,0,0.15)` on the receipt column to lift it off the page background.

---

## 7. What NOT to Do

1. **Don't make the entire site one giant receipt.** Use `================================` dividers to create visual breathing room. Dense walls of monospace with no hierarchy are illegible and frustrating.

2. **Don't sacrifice the Polaroid photo to the theme.** The photo block should be the largest visual element on the piece page — larger than any text block. The receipt is the context; the pot is the content.

3. **Don't use timestamps as a substitute for helpful context.** "ENDING: 2026-05-02 16:30:00" is less useful than "ENDING: 2026-05-02 16:30:00 (2H 14M)". Include the countdown next to timestamps for auction pieces.

4. **Don't use ASCII art doodles** (`¯\_(ツ)_/¯`, boxed illustrations built from characters). That's a different aesthetic (IRC/bulletin board). Receipt terminals printed text and basic formatting, not art.

5. **Don't apply monospace to all text regardless of length.** IBM Plex Mono is readable but line-height needs to be generous (`1.6` minimum) for paragraph text. Don't compress long descriptions into a narrow column.

6. **Don't skip the receipt vocabulary on error messages.** `"Something went wrong"` is a lost opportunity. `"ERR: REQUEST FAILED — CODE 500"` is on-theme and actually more informative. The entire theme should speak receipt-language.

7. **Don't make the SKU system cute at the expense of function.** The admin should be able to find `MUG-2026-014` quickly. The SKU should appear in search results and be searchable.

8. **Don't use VT323.** It looks great at 64px. At 14px (body text) it becomes unreadable pixel mush. IBM Plex Mono is the right call.

---

## 8. Mobile Treatment

**RECEIPT is the most mobile-native of the three themes.** Real receipts are 80mm (roughly 300px) wide — the receipt column layout is essentially pre-optimized for mobile screens.

| Element | Mobile Treatment |
|---------|-----------------|
| Receipt column | Full-width, 16px horizontal padding |
| Polaroid photo | Full-width (no sidebar on mobile) |
| Browse receipt list | Full-width, each item expands to 3-4 lines |
| Paper texture | Keep |
| Receipt curl shadow | Keep |
| Timestamps | Keep (they're short, no wrapping issues) |
| Dot-matrix animation | Keep — works perfectly on mobile |
| SKU display | Keep — short enough to not wrap |
| Bracket buttons | Keep — wide enough on most screens |

**One adjustment:** At mobile, the browse receipt should use `font-size: 12px` for line items (from 14px) to fit more content per screen without scrolling fatigue. The type scale drops by 1 step at `< 480px`.

The receipt column has a max-width of `560px` centered on desktop. On mobile it fills the viewport. This is exactly right — the narrowing is the aesthetic.
