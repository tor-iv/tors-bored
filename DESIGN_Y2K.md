# Y2K Theme Spec

**Vibe:** Sincere GeoCities/Angelfire 1999–2003. Committed to the bit, not ironic about it. The pottery is beautifully photographed; the *wrapper* is unhinged. The goal is period-correct nostalgia done with care, not lazy Comic Sans slapped on a white page.

**The photography is sacred.** The pots live inside beveled frames and deserve their dignity.

---

## 1. Libraries

### 98.css

```bash
bun add 98.css
```

Import it scoped exclusively to the Y2K theme to prevent style bleed:

```css
/* globals.css */
[data-theme="y2k"] {
  @import '98.css'; /* or use a wrapper approach */
}
```

Actually: import it at the top of the file and wrap all selectors. The practical approach is a PostCSS plugin or a dedicated `y2k.css` that reimports and prefixes 98.css selectors with `[data-theme="y2k"]`. This is essential — 98.css will destroy other themes if applied globally.

**98.css provides:** button bevel, sunken inputs, window chrome, scrollbar styling, checkbox/radio styling.

### No additional JavaScript libraries

Everything period-correct can be done in CSS + React. No jQuery, no additional deps.

---

## 2. Fonts

The era had exactly four fonts and you deployed them all at once:

| Font | Where | Notes |
|------|-------|-------|
| Comic Sans MS, cursive | Page title, marquee text, "NEW!" badges, empty state headline | Used SPARINGLY — 3–4 instances per page max. The joke lands because it's selective. |
| Tahoma, "MS Sans Serif", sans-serif | All UI chrome: buttons, labels, nav, form text | The actual Win98 system font. Authentic. |
| Verdana, Geneva, Tahoma, sans-serif | Body text, descriptions, readable paragraphs | The readable web font of the era. 14px minimum. |
| "Courier New", monospace | Prices, counters, visitor count, timestamps, code-y things | The period-correct monospace. |

```css
[data-theme="y2k"] {
  --font-display: 'Comic Sans MS', cursive;
  --font-body:    Verdana, Geneva, Tahoma, sans-serif;
  --font-ui:      Tahoma, 'MS Sans Serif', sans-serif;
  --font-mono:    'Courier New', monospace;
}
```

**The rule:** Comic Sans only appears where it's funny *because* it's Comic Sans — the site title, the marquee, the "WELCOME TO MY WEBSITE" energy. Using it for auction mechanics or bid history kills the joke.

---

## 3. Color Palette

The era was loud. Be accurate, not just loud.

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#c0c0c0` | Page background (classic Win98 desktop silver) |
| `--bg-well` | `#d4d0c8` | Window/dialog backgrounds |
| `--bg-dark` | `#808080` | Depressed buttons, inactive window chrome |
| `--ink` | `#000000` | All text (pure black — no warm tones here) |
| `--ink-muted` | `#444444` | Secondary text |
| `--accent` | `#000080` | Active window title bar, primary action color (navy blue) |
| `--accent-light` | `#d0d0ff` | Light navy tint for hover states |
| `--teal` | `#008080` | Desktop/taskbar color, section borders, the other classic Win98 color |
| `--link` | `#0000ff` | Hyperlink blue (pure, no toning down) |
| `--link-visited` | `#800080` | Visited link purple |
| `--badge-new` | `#00ff00` | "NEW!" badge on recent items (lime green, use sparingly) |
| `--blink-red` | `#ff0000` | Auction countdown clock, urgent state |
| `--error` | `#ff0000` | Error states |
| `--success` | `#008000` | Success states |

**Backgrounds (pick one default per page, swap for personality):**

- **Default:** `#c0c0c0` solid — classic Win98 desktop gray
- **Alternative 1:** `#008080` (teal) — the other classic Win98 desktop
- **Alternative 2:** CSS starfield — `background: #000 url(data:image/svg+xml,...)` with tiny white dots (SVG data URI, no external file)
- **Alternative 3:** Repeating crosshatch in very subtle `#b8b8b8` on `#c0c0c0`

The homepage gets the starfield. Interior pages get the gray.

---

## 4. Component System

### Beveled Buttons (98.css)

98.css handles this automatically via `.btn` class. For React:

```tsx
<button className="win98-btn">SUBMIT BID</button>
```

Manual CSS if 98.css scoping is tricky:
```css
.win98-btn {
  background: #d4d0c8;
  border-top: 2px solid #ffffff;
  border-left: 2px solid #ffffff;
  border-right: 2px solid #000000;
  border-bottom: 2px solid #000000;
  box-shadow: inset 1px 1px #dfdfdf, inset -1px -1px #808080;
  padding: 4px 12px;
  font-family: Tahoma, sans-serif;
  font-size: 11px;
  cursor: default;
  active: { /* invert borders */ }
}
```

**Primary CTA (Place Bid, Checkout):** navy blue (`#000080`) background with white text — the "active window title" treatment.

**Disabled:** lighter bevel, cursor: not-allowed.

### Form Inputs (Sunken Borders)

98.css `.text-field` provides the sunken look:
```
border-top: 1px solid #808080;
border-left: 1px solid #808080;
border-right: 1px solid #dfdfdf;
border-bottom: 1px solid #dfdfdf;
inset box-shadow: 1px 1px 0 #000;
background: #ffffff;
```

Labels in Tahoma, 11px. Inputs in Tahoma, 11px. No floating labels — period-correct labels are always above or beside the field.

### Browse Grid

**HTML table** with visible borders — this is authentic and looks perfect:

```tsx
<table className="win98-table" cellSpacing={0} cellPadding={0}>
  <thead>
    <tr>
      <th>ITEM</th><th>CURRENT BID</th><th>TIME LEFT</th><th>STATUS</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id} className="win98-table-row">
        <td>[thumbnail + name]</td>
        ...
      </tr>
    ))}
  </tbody>
</table>
```

Alternating white/`#f0f0f0` row backgrounds. `border: 1px solid #808080` on the table. Header row in `#000080` background with white Tahoma text.

Alternatively (for a more "personal site" feel): a grid of beveled "window" boxes. Each item is a `<div class="win98-window">` with a title bar and content area. More visually wild, more period-correct for a personal page.

**Recommendation:** Use window-boxes on the homepage (wilder, more personal-site), table layout on `/browse` and `/auctions` (more functional).

### Bid Widget

```html
<div class="win98-window bid-window">
  <div class="win98-title-bar">
    <span>🏺 Place Your Bid</span>
    <div class="win98-title-bar-controls">
      <button aria-label="Minimize">_</button>
      <button aria-label="Maximize">□</button>
      <button aria-label="Close">✕</button>
    </div>
  </div>
  <div class="win98-window-body">
    <label>Current Bid: <strong>$45.00</strong></label>
    <br/>
    <label for="bid-amount">Your Bid ($): </label>
    <input type="number" id="bid-amount" class="text-field" />
    <br/>
    <button class="win98-btn primary">SUBMIT BID</button>
    <button class="win98-btn">CANCEL</button>
  </div>
</div>
```

### Cart (HTML Table)

```html
<table class="win98-cart-table">
  <tr><th colspan="3">SHOPPING CART</th></tr>
  <tr><td>Soda-Fired Mug</td><td>MUG-2026-014</td><td>$45.00</td></tr>
  <tr><td colspan="2"><strong>TOTAL</strong></td><td><strong>$45.00</strong></td></tr>
</table>
<button class="win98-btn primary">PROCEED TO CHECKOUT →</button>
```

### Win98 Modal Dialogs

This requires completely different DOM than a standard modal — this is where CVA isn't enough and we conditionally render a different component entirely:

```tsx
// components/theme/y2k/Win98Modal.tsx
<div className="win98-window win98-dialog" role="dialog">
  <div className="win98-title-bar">
    <div className="win98-title-bar-text">
      <img src="/icons/info.png" alt="" width={16} height={16} />
      {title}
    </div>
    <div className="win98-title-bar-controls">
      <button aria-label="Close" onClick={onClose}>✕</button>
    </div>
  </div>
  <div className="win98-window-body">
    {children}
    <div className="win98-button-row">
      {actions}
    </div>
  </div>
</div>
```

### Loading State

Animated hourglass — pure CSS:
```css
@keyframes hourglass-flip {
  0%, 40%  { transform: rotate(0deg); }
  50%, 90% { transform: rotate(180deg); }
  100%     { transform: rotate(180deg); }
}
.win98-hourglass {
  animation: hourglass-flip 1.4s ease-in-out infinite;
  font-size: 2rem;
}
```
With "Please wait..." in Tahoma below.

### Empty State

```html
<div class="win98-window" style="max-width: 400px; margin: auto">
  <div class="win98-title-bar">
    <span>🚧 Under Construction</span>
  </div>
  <div class="win98-window-body" style="text-align: center; padding: 32px">
    <img src="/y2k/under-construction.gif" alt="Under construction" />
    <p style="font-family: Comic Sans MS">No items found!</p>
    <p style="font-family: Verdana; font-size: 12px">
      Check back soon — Tor is busy at the wheel.
    </p>
  </div>
</div>
```
The GIF can be a CSS animation mimicking the spinning construction sign (no external file needed).

### Error State

Win98 error dialog exactly:
```html
<div class="win98-window win98-dialog" style="max-width: 360px">
  <div class="win98-title-bar win98-title-bar--error">
    <span>⚠️ Error</span>
    <button>✕</button>
  </div>
  <div class="win98-window-body">
    <div class="win98-error-content">
      <img src="/icons/error.png" width="32" height="32" />
      <p>An error has occurred.<br/>Please try again.</p>
    </div>
    <div class="win98-button-row">
      <button class="win98-btn">OK</button>
    </div>
  </div>
</div>
```

---

## 5. Photography Integration

**Photo frame:** CSS bevel that matches the Win98 sunken/raised frame style:
```css
.win98-photo-frame {
  border-top:    2px solid #000000;
  border-left:   2px solid #000000;
  border-right:  2px solid #dfdfdf;
  border-bottom: 2px solid #dfdfdf;
  box-shadow:    inset 1px 1px #808080, inset -1px -1px #ffffff;
  display: inline-block;
}
```

**"NEW!" badge:** Lime green (`#00ff00`) pill badge, black text, Comic Sans or bold Tahoma, shown on items added within the last 30 days. Position it as a top-left overlay on the photo frame.

**No animated borders or effects on the photo itself.** The bevel frame is enough. The pot photo is clean inside.

---

## 6. Signature Details (exactly 6, committed)

### 1. Marquee (CSS animation, no `<marquee>` tag)
```css
@keyframes marquee-scroll {
  from { transform: translateX(100%); }
  to   { transform: translateX(-100%); }
}
.marquee-content {
  display: inline-block;
  white-space: nowrap;
  animation: marquee-scroll 20s linear infinite;
  font-family: 'Comic Sans MS', cursive;
  font-size: 14px;
  color: #ffff00;
  background: #000080;
  padding: 4px 0;
}
```
**Marquee text:** `★ TOR'S POTTERY ★ HANDMADE IN BROOKLYN ★ WHEEL-THROWN & SLAB-BUILT ★ FREE SHIPPING OVER $100 ★ NEW PIECES ADDED WEEKLY ★`

Appears in a full-width band directly below the navigation bar.

### 2. Fake Visitor Counter
Reuse the existing `useVisitorNumber` hook from `/design-preview/retro`. Seed with a plausible number:
```tsx
const visitorCount = useVisitorNumber(6); // e.g. "012,847"
```
Display in the footer as:
```
You are visitor number: [0 1 2 , 8 4 7]
```
Each digit in its own little "LCD" box styled with Courier New, `#ffffff` on `#000000`.

### 3. "Last Updated" Footer Timestamp
```tsx
// Updated: {format(new Date(), 'MMMM d, yyyy')}
```
In Tahoma 11px at the very bottom of every page. "Page last updated: May 2, 2026." Automatically current — the joke is it's always today.

### 4. Cursor Trail (CSS + minimal JS)
A `<div class="cursor-trail">` absolutely positioned, `pointer-events: none`, `z-index: 9999`. On `mousemove`, create 3–4 small dot elements that follow the cursor with a brief fade-out animation:
```css
.trail-dot {
  position: fixed;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--teal);
  pointer-events: none;
  animation: trail-fade 400ms ease-out forwards;
}
@keyframes trail-fade {
  from { opacity: 0.8; transform: scale(1); }
  to   { opacity: 0;   transform: scale(0.2); }
}
```
Create dots in a `CursorTrail` component using `requestAnimationFrame`. Pool and reuse the dot elements (max 8 in the DOM at once) to keep it performant. Teal dots with a slight clay-dot variant on the piece page.

### 5. Custom Pointing-Hand Cursor
```css
[data-theme="y2k"] {
  cursor: url('/cursors/win98-default.cur'), default;
}
[data-theme="y2k"] a,
[data-theme="y2k"] button {
  cursor: url('/cursors/win98-pointer.cur'), pointer;
}
```
The classic Win98 pointing hand (white glove hand with drop shadow). If `.cur` files feel too foreign, use SVG equivalents.

### 6. Auction Countdown as Blinking Digital Clock
```tsx
<div className="win98-clock-countdown">
  <span className="clock-segment">{hours}</span>
  <span className="clock-colon">:</span>
  <span className="clock-segment">{minutes}</span>
  <span className="clock-colon">:</span>
  <span className="clock-segment">{seconds}</span>
</div>
```
```css
.win98-clock-countdown {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: #ff0000;
  letter-spacing: 4px;
}
.clock-colon {
  animation: blink-colon 1s step-start infinite;
}
@keyframes blink-colon {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
```
When < 1 hour remaining, the entire counter pulses red. When < 5 minutes, the background of the countdown widget flashes between `#000000` and `#ff0000`.

---

## 7. What NOT to Do

1. **Don't just slap Comic Sans on a white page.** The Win98 gray background, the beveled chrome, the sunken inputs — the whole system has to be there. Isolated Comic Sans is just bad design, not Y2K.

2. **Don't use `<marquee>` or `<blink>`.** They're deprecated, have inconsistent behavior, and are inaccessible. CSS animations replicate the effect properly.

3. **Don't make it actually unusable.** Period-correct aesthetic doesn't mean broken UX. Tap targets must still be accessible, text must still be readable, form flows must still work. The joke is the *style*, not the function.

4. **Don't make the cursor trail CPU-intensive.** Cap at 8 trail dots total, use `requestAnimationFrame`, pool elements rather than creating/destroying. Test on a mid-range phone before shipping.

5. **Don't confuse "Y2K" the cultural era (1997–2003) with Y2K the tech bug.** No error messages about year 2000 compatibility, no millennial bug references. This is the era's *web aesthetic*, not the disaster.

6. **Don't use `#c0c0c0` backgrounds without Win98 window chrome on top.** The gray only works as a desktop; the "windows" sitting on top of it are essential to the metaphor.

7. **Don't ignore table semantics.** Using `<table>` for layout is period-correct and also, in this case, genuinely semantic (browse grid *is* tabular data). Use proper `<thead>`, `<th scope>`, etc.

8. **Don't commit to too many external GIF files.** The aesthetic can be achieved mostly with CSS. External GIFs slow page load and feel cheap.

---

## 8. Mobile Treatment

Y2K was desktop-only. The adaptation strategy: acknowledge the limitation, then make it work anyway.

**"Best viewed in 1024×768"** disclaimer: Show a small Win98 dialog-style tooltip on first mobile visit:
```html
<div class="win98-window" style="position: fixed; bottom: 16px; right: 16px; max-width: 280px; z-index: 999">
  <div class="win98-title-bar">⚠️ Display Notice</div>
  <div class="win98-window-body" style="font-size: 11px; padding: 8px">
    This site is best viewed at 1024×768 resolution in Internet Explorer 6.<br/>
    <small style="color: #666">(We did our best.)</small>
    <div style="text-align: right; margin-top: 8px">
      <button class="win98-btn" onclick="this.closest('.win98-window').remove()">OK</button>
    </div>
  </div>
</div>
```
Shows once (localStorage flag), dismissable.

**Specific adaptations:**

| Element | Mobile Treatment |
|---------|-----------------|
| Win98 modals | Bottom sheet with title bar preserved visually, reflows to full-width |
| Browse table | Stacks to single column; hide less important columns |
| Marquee | Keep — works great on narrow screens |
| Cursor trail | Disable — touch has no cursor |
| Win98 beveled frame | Keep — looks great on mobile |
| Digital clock | Keep — scale down slightly |
| Visitor counter | Keep |
| "Last Updated" footer | Keep |
| Window chrome on cards | Keep, but use `width: 100%` |
