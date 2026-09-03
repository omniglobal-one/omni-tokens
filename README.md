# @omni/tokens

Level 1 of **The OMNI Standard**: the seven layers every OMNI product shares
outright — neutrals, semantic colors, type scale, spacing/radius/elevation
rules, self-hosted fonts — plus the six-token *pattern* each product uses to
turn its own one signature hex into a full accent system (Level 2).

This package has no build step and no runtime dependencies. It is meant to be
consumed as-is by Next.js/Tailwind apps that are themselves separate repos
(Care, Pay, Queue, Rewards, Share, Sports, Talent, Vendor each have their own
GitHub repo and Vercel project — this is not a monorepo).

## What's in here

| File | What it is |
|---|---|
| `src/tokens.css` | `:root` CSS custom properties for neutrals, semantic colors, shadows, radius, motion — light + dark, three-state theme pattern |
| `src/fonts.css` | `@font-face` rules for the self-hosted latin-subset fonts |
| `fonts/*.woff2` | The actual font files (real Google Fonts latin subsets, ~103KB total for all three families) |
| `src/tailwind-preset.js` | A Tailwind `preset` wiring the above into utility classes, plus the enforced radius/shadow collapse |
| `src/product-accents.js` | `buildProductAccentTokens(hex)` — derives the six-token accent structure from one base hex |
| `src/products.js` | The eight resolved product hexes, per the finalized proposal + Step 1's shipped-material check |

## Install (per product repo)

Since there's no private npm registry yet, install directly from git until one exists:

```jsonc
// package.json, in each of the 8 product repos
"dependencies": {
  "@omni/tokens": "github:omniglobal-one/omni-tokens#v1.0.0"
}
```

(Tag `v1.0.0` on this package's own repo once it's pushed — pin to a tag, not
a branch, so a product doesn't silently pick up a mid-development change.)

## Wire it up

**1. Tailwind config** — add as a preset, don't copy the theme block:

```js
// tailwind.config.js
module.exports = {
  presets: [require('@omni/tokens/tailwind-preset')],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
}
```

**2. Global CSS** — import the shared tokens and fonts once:

```css
/* app/globals.css */
@import '@omni/tokens/tokens.css';
@import '@omni/tokens/fonts.css';
```

**3. Font files** — Next.js only serves what's in its own `public/`, so copy
the five files once per repo (a `postinstall` script or a one-time copy is
fine — these rarely change):

```
node_modules/@omni/tokens/fonts/*.woff2  →  public/fonts/
```

**4. The product's own accent** — set it once, server-side, so it's in the
initial HTML (no flash of the wrong color). In the root layout:

```tsx
// app/layout.tsx
import { accentTokensToCssVars, PRODUCTS } from '@omni/tokens'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: accentTokensToCssVars(PRODUCTS.care) }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

Swap `PRODUCTS.care` for `PRODUCTS.pay`, `.queue`, `.rewards`, `.share`,
`.sports`, `.talent`, or `.vendor` — that one line is the *entire*
difference between one product's theme and another's.

## Using the tokens in components

```tsx
<button className="bg-accent hover:bg-accent-hover active:bg-accent-active
                    text-accent-contrast rounded-sm px-4 py-2 font-sans font-semibold
                    transition-colors duration-DEFAULT">
  Primary action
</button>

<span className="bg-accent-soft text-accent px-2 py-0.5 rounded-full text-caption uppercase">
  Badge
</span>

<div className="bg-accent-subtle/8 border-l-2 border-accent px-3 py-2">
  Selected row
</div>
```

Neutrals and semantics work the same way: `bg-omni-surface`, `text-omni-ink`,
`border-omni-border`, `bg-success-soft text-success`, etc.

## Why the accent is a function, not eight forked files

`buildProductAccentTokens(hex)` takes one hex and derives hover (−6% L),
active (−11% L), soft (a light solid tint for badges), subtle (the raw
triple, for low-alpha washes), and contrast (white or ink, chosen by a real
WCAG contrast check, not assumed). This is what Step 2 of the implementation
plan means by "a pattern, not hardcoded per-product" — no product repo
hand-tunes its own hover shade, so there's no way for the eight to drift
out of sync with each other over time.

## Resolved product colors (`src/products.js`)

| Product | Hex | Status |
|---|---|---|
| Care | `#0B7A3E` | Nudged from stock emerald-700, hue-separation only |
| Pay | `#1E40AF` | Unchanged |
| Queue | `#4D7C0F` | Unchanged |
| Rewards | `#9C6B0A` | Nudged from stock amber-700, hue-separation only |
| Share | `#0C6B9E` | Nudged from stock cyan-700, hue-separation only |
| Sports | `#B8380A` | Nudged from stock orange-700, hue-separation only |
| Talent | `#5B21B6` | Unchanged |
| Vendor | `#86198F` | Unchanged |

## What's deliberately NOT in this package

- **Components.** Buttons, inputs, tables, etc. are Step 3 (`@omni/ui`), built
  on top of these tokens — this package only exports tokens and the Tailwind
  wiring for them.
- **Spacing scale overrides.** Tailwind's default spacing scale is already a
  4px base (`space-1` = 4px ... `space-14` = 56px, `space-20` = 80px) and
  matches the doc's `--sp-1..--sp-10` exactly — nothing to redefine.
- **Per-product marketing copy, imagery, or IA.** Level 1 stops at the visual
  system. What a product's dashboard actually contains is that product's call.
