# HAND-DRAWN Theme Spec

**Vibe:** A serious potter's studio notebook. Not childish. Warm, sincere, crafty — the kind of sketchbook a working artist uses to document glaze tests and forms, not a kindergarten art project.

**The photography is sacred.** This theme frames the pots in a sketchbook aesthetic; it never competes with them.

---

## 1. Libraries

### Rough.js + react-rough-fiber

```bash
bun add roughjs react-rough-fiber
```

**Use Rough.js for:**
- Card borders on the browse grid
- Primary and secondary button borders
- Photo frames on the piece page (the most prominent use)
- Modal/dialog outer border

**Do NOT use Rough.js for:**
- Every single border everywhere — overuse degrades performance and looks lazy
- Inline text elements or small UI details
- Dividers (use a simple SVG brush-stroke line instead)
- Mobile: reduce roughness to 0.8 and debounce resize; use static SVG fallback at < 480px

**react-rough-fiber** lets Rough.js render inside React without direct DOM manipulation. Use `<RoughSVG>` wrappers from `react-rough-fiber`.

### Other assets
- `/public/doodles/` — static SVG files for corner flourishes (drawn once, not Rough.js generated)
- `/public/textures/paper.svg` — subtle paper grain, used as CSS background-image
- `/public/cursors/pencil.svg` and `pencil-pointer.svg` — custom cursors

---

## 2. Fonts

**Primary (headings, labels, buttons, prices, short UI text):** Caveat  
Already loaded in the site. Use at 400, 600, 700.

**Body (descriptions, long text, legal, anything > ~20 words):** Nunito  
Legible sans with warm, rounded curves that pair well with Caveat without fighting it.

```css
/* in globals.css under [data-theme="handdrawn"] */
--font-display: 'Caveat', cursive;
--font-body:    'Nunito', var(--font-sans);
```

**The rule:** Caveat for anything that fits on 1-2 lines. Nunito for any text that wraps or is read as a paragraph. If you're debating, use Nunito — a pot description in Caveat at body size is illegible and undermines trust.

**Type scale:**
| Use | Font | Size | Weight |
|-----|------|------|--------|
| Page title | Caveat | 2.5rem | 700 |
| Section heading | Caveat | 1.75rem | 600 |
| Card title | Caveat | 1.25rem | 600 |
| Price / current bid | Caveat | 1.5rem | 700 |
| Button label | Caveat | 1rem | 600 |
| Body text | Nunito | 1rem | 400 |
| Caption / secondary | Nunito | 0.875rem | 400 |
| Meta / timestamps | Nunito | 0.75rem | 400 |

---

## 3. Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| `--bg` | `#f7f3e8` | Page background (warm cream, like aged sketchbook paper) |
| `--bg-well` | `#ede8d8` | Card backgrounds, input wells, slightly darker cream |
| `--ink` | `#1b1211` | Primary text (near-black with a warm brown cast, like india ink) |
| `--ink-muted` | `#3d3028` | Secondary text, captions, labels |
| `--accent` | `#8c6e4b` | Interactive elements: links, buttons, borders (warm clay brown) |
| `--accent-hover` | `#7a5e3b` | Hover state for accent |
| `--accent-light` | `#e8d9b5` | Accent-tinted backgrounds, badge fills, tag backgrounds |
| `--border` | `#c4b89a` | Dividers, subtle borders, input borders |
| `--error` | `#9b3a2c` | Error states (muted terracotta red — not alarm red) |
| `--success` | `#5a7a4a` | Success states (muted sage green) |

**Rough.js stroke color:** `#1b1211` (--ink) at 1.5–2px stroke width  
**Rough.js fill:** match the component's background  
**Roughness setting:** 1.2–1.8 depending on element size (smaller = lower roughness)

---

## 4. Component System

### Buttons

**Primary:**
- Rough.js rectangle border, `--accent` fill, `--bg` text
- Caveat 1rem 600
- Roughness: 1.5
- Hover: `--accent-hover` fill
- Active: slight scale(0.98)
- Padding: 12px 24px

**Secondary:**
- Rough.js rectangle border, no fill (transparent), `--accent` text
- Same font/size as primary

**Ghost:**
- No border box
- `--ink` text with a hand-drawn underline (SVG `<line>` with slight wobble below text)
- Hover: underline thickens

### Form Inputs

- Bottom border only (like filling in a hand-ruled form): `border-b border-[--border]`
- No box, no background
- On focus: border becomes `--accent` color
- Placeholder: `--ink-muted` color
- Label: Caveat 0.875rem above the field
- Error state: border turns `--error`, small error text below in Nunito

### Bid Input

- Larger than a standard input (the bidding action should feel important)
- "Current bid: $XX" label in Caveat 1rem, muted
- Number input: Caveat 1.5rem, bottom border only
- `[ PLACE BID ]` primary button alongside
- Rough.js wrapper around the entire bid zone (light roughness ~1.0 on a larger rect)

### Cards (Browse Grid)

- Rough.js rectangular border, `--bg-well` fill, 1.5 roughness
- Photo at top (see Photography section)
- Title: Caveat 1.25rem, `--ink`
- Price: Caveat 1.5rem, `--accent`
- Type badge (AUCTION / BUY NOW): small Caveat tag, `--accent-light` background
- Hover: Rough.js border slightly redraws (the wobble shifts slightly — do this by re-seeding on hover)

### Cart Row

- Simple horizontal layout
- Thumbnail photo (small, rounded per Rough.js wrapper)
- Item name in Caveat, price in Caveat
- No card border — rows separated by a brush-stroke SVG divider

### Bid History Entry

- Each entry is a line: date + amount + status
- Nunito 0.875rem
- Newest bid at top, slightly larger
- Subtle `--bg-well` background on the current winning bid

### Dividers

- SVG brush stroke: a single wavy horizontal line (~1px, `--border` color)
- Not Rough.js — just a hand-drawn SVG asset reused everywhere
- Two variants: light (between sections) and medium (between major page sections)

### Modals / Dialogs

- Rough.js outer border, 2px stroke, 1.8 roughness
- `--bg` background
- Slight drop shadow: `4px 6px 0 rgba(0,0,0,0.08)` (offset, not centered — looks like it's taped down)
- Close button: a hand-drawn X (SVG)
- Appears with a slight paper-drop-in Framer Motion animation (drop from above, slight rotation)

### Toasts / Notifications

- Square sticky-note shape: `--accent-light` background, Rough.js border
- 2–3° rotation (varies per toast — feels casually placed)
- Caveat text
- Appears at top-right (or bottom-center on mobile)
- Slides in, stays 4 seconds, fades out

### Loading State

- Animated pottery wheel SVG (simple, hand-drawn style)
- "Just a moment..." in Caveat below
- Subtle breathing scale animation on the wheel

### Empty State

- Hand-drawn SVG illustration of an empty wooden shelf
- "Nothing here yet." in Caveat 1.75rem
- Secondary Nunito text below ("Check back soon — new pieces are added regularly.")

### Error State

- A hand-drawn X or scribble SVG
- "Something went wrong." in Caveat, `--error` color
- Retry button in secondary style

---

## 5. Photography Integration

### On the piece page (hero photo)

1. **Rough.js border** (`<RoughBorder>` wrapper): roughness 1.5, stroke 2px, `--ink` color
2. **Corner flourishes**: 4 small SVG doodles placed at each corner via absolute positioning — these are static assets (e.g., a tiny star, a leaf, a dot cluster, a curved arrow). Not randomly generated. Choose 8–10 assets and pick randomly from the set.
3. Photo itself: full-color, no filter, no treatment. Let it breathe inside the sketchy frame.
4. The frame has a slight white `--bg` inner padding (8–12px) between the rough border and the photo edge.

### On browse grid cards

- Rough.js border on the photo thumbnail only (lighter roughness, ~1.0)
- No corner flourishes on cards (too small to read)

### MVP Note

Per-pot annotations (arrows pointing at glaze details) are a v2 feature. In MVP, the sketchbook aesthetic comes from the frame and corner flourishes, not text labels on the photo.

---

## 6. Signature Details (exactly 4, committed)

### 1. Dog-eared Page Corner (CSS)
Top-right corner of the page looks like a bent page corner.

```css
body::before {
  content: '';
  position: fixed;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: linear-gradient(
    225deg,
    var(--bg) 50%,
    var(--border) 50%
  );
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  z-index: 1000;
  pointer-events: none;
}
```
The folded-back triangle is `--border` color; the paper underneath is `--bg`. Subtle but committed.

### 2. Paper Texture Overlay (CSS)
A faint paper grain across the entire page.

```css
body::after {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url(/textures/paper.svg);
  background-repeat: repeat;
  background-size: 200px;
  opacity: 0.35;
  pointer-events: none;
  z-index: 999;
}
```
The SVG texture is a subtle noise/crosshatch. Keep opacity below 0.4 — it should be felt, not seen.

### 3. Custom Drawn Cursor
```css
[data-theme="handdrawn"] {
  cursor: url('/cursors/pencil.svg') 4 28, auto;
}
[data-theme="handdrawn"] a,
[data-theme="handdrawn"] button,
[data-theme="handdrawn"] [role="button"] {
  cursor: url('/cursors/pencil-pointer.svg') 12 0, pointer;
}
```
The pencil cursor points downward at the tip. On touch devices: disabled (meaningless). SVGs must be 32×32px max for cursor spec compliance.

### 4. Page Flip Transition (Framer Motion)
Between route navigations (using Next.js `<Link>`), the page exits with a slight rightward slide and subtle scale-down (like a page being turned), and the new page enters from the left.

```tsx
// Page transition wrapper
const pageVariants = {
  initial:  { opacity: 0, x: -20, rotateY: -3 },
  animate:  { opacity: 1, x: 0,   rotateY: 0  },
  exit:     { opacity: 0, x:  20, rotateY:  3  },
};
```
Keep the rotation subtle (3°) and the duration short (220ms). On mobile, simplify to a horizontal fade-slide (no rotation — disorienting on small screens).

---

## 7. What NOT to Do

1. **Don't Rough.js every border.** Every element with a wobbly edge is visual noise. Reserve it for 3–5 key elements per page: photo frames, primary buttons, cards, modals. Everything else gets clean lines.

2. **Don't use Caveat for body copy.** It's charming at display sizes. At 1rem over 3+ lines it becomes a readability problem and undercuts trust.

3. **Don't use bright colors.** Everything should feel like it's been through the wash once. No electric blue, no pure red. Muted terracotta and sage only.

4. **Don't add school-kid doodles** (suns with rays, stick figures, smiley faces, hearts). A serious artist's sketchbook has organic forms, botanical marks, directional arrows, shape studies. Keep decorative SVGs minimal and craft-adjacent.

5. **Don't animate rough borders on every hover.** The redraw is expensive and distracting. Animate only intentionally: the card hover redraw is fine; re-drawing every time a cursor enters a form field is not.

6. **Don't make the paper texture visible at arm's length.** If you can see the grain pattern clearly, reduce opacity. It should be subliminal.

7. **Don't make the custom cursor illegible.** The pencil SVG must clearly communicate "pointer" on interactive elements — don't sacrifice function for aesthetics.

8. **Don't rotate every element.** One or two slightly-rotated toasts are charming. A grid of rotated cards looks broken.

---

## 8. Mobile Treatment

Most of this theme translates naturally to mobile. Specific adaptations:

| Element | Mobile Treatment |
|---------|-----------------|
| Dog-eared corner | Keep — works at any viewport width |
| Paper texture | Keep |
| Custom cursor | Disable — touch devices don't have cursors |
| Page flip transition | Simplify to horizontal fade-slide, no `rotateY` |
| Rough.js borders | Reduce roughness from 1.5 → 0.8; debounce window resize redraws |
| Rough.js on cards | Consider static SVG borders below 480px for performance |
| Corner flourishes | Keep on piece page hero; remove from grid cards at mobile |
| Browse grid | 1-column on mobile, 2-column on tablet |
| Typography | Caveat scales well; no size changes needed |
