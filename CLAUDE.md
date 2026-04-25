# Oculé — Project Context for Claude Code

A browser-only RSVP (Rapid Serial Visual Presentation) speed reader with an ORP (Optimal Recognition Point) anchor. Personal scratch-the-itch + UI craftsmanship project — not a product yet.

## Quick start

```bash
npm install      # if node_modules missing
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npx tsc -b       # typecheck only
```

## Stack (locked — do not change without asking)

- **Vite + React 18 + TypeScript**
- **Tailwind CSS v3** (utilities + design-token bridging)
- **shadcn/ui** primitives (Radix-backed) — Button, Textarea, Popover, Slider, Switch, Dialog
- **CSS variables** for theme tokens (dual dark/light), with shadcn theme vars remapped onto our palette in `tailwind.config.js`
- **No backend.** Pure static SPA. Persistence is `localStorage` only.
- Path alias: `@/*` → `./src/*`

The user explicitly chose "strictly follow the PRD" over a more pragmatic plain-CSS approach. **Don't propose dropping Tailwind or shadcn** in conversation unless they ask.

## Directory layout

```
src/
  App.tsx                      # top-level state + keyboard handler + view router
  main.tsx
  types.ts                     # Settings, Session, DEFAULT_SETTINGS
  lib/
    tokenize.ts                # text → tokens with smoothed pauseWeight
    orp.ts                     # ORP letter index lookup, splitORP()
    dwell.ts                   # ms-per-token math
    smoothstep.ts              # easing helper
    utils.ts                   # cn() (clsx + tailwind-merge)
  hooks/
    useRSVP.ts                 # rAF-driven RSVP state machine
    useLocalStorage.ts
    useAutoHide.ts             # mouse-idle visibility
  components/
    ui/                        # shadcn primitives — edit directly
      button.tsx textarea.tsx popover.tsx slider.tsx switch.tsx dialog.tsx
    PasteView.tsx
    ReaderView.tsx
    WordDisplay.tsx            # ORP-anchored word rendering
    PeripheralContext.tsx      # faded prev/next words with gradient masks
    Chrome.tsx                 # top-left WPM cluster + top-right hamburger
    SettingsPopover.tsx
    ChromeSlider.tsx           # invertable slider for WPM panel
    ScrubBar.tsx               # paused-state position scrubber
    ProgressBar.tsx            # bottom 1px progress sliver
    AboutModal.tsx             # uses shadcn Dialog
    OculeLogo.tsx              # top-center wordmark with ORP-highlighted "c"
  styles/
    globals.css                # Tailwind directives + base reset
    tokens.css                 # CSS variables for both themes + font loading
    components.css             # bespoke styles (most of the visual work lives here)
```

## Design system

**Aesthetic: "dark library"** — quiet, literary, restrained. References: iA Writer focus mode, Readwise Reader, Kindle Paperwhite low-backlight. Never apps like Notion or Linear.

**Palette (CSS vars in `tokens.css`):**
- Dark default: warm near-black `#14110F` bg, soft off-white `#E8E3DB` text, **amber `#D4A574` ORP** (lamplight, never red), sage `#6B8E7F` accent
- Light: aged-paper `#F5F1E8` bg, dark `#2A2520` text, **deep burgundy `#8B2E2E` ORP**, forest `#3E5D4E` accent

**Typography: Monaspace Xenon** monospace-serif (loaded from jsDelivr). The font picker for serif/sans/humanist/dyslexic was **removed** but the type definition, CSS rules, and `@font-face` for OpenDyslexic are intentionally left in `Settings.font`, `tokens.css`, and `components.css` as dead-but-revivable code. **Don't delete.**

**Motion:** all transitions 30–280ms, easing `cubic-bezier(0.4, 0, 0.2, 1)`. Library-quiet — no springs, no bounces.

## Locked product decisions (don't reverse without asking)

- **Mono-only fonts.** `App.tsx` hardcodes `data-font="mono"` regardless of `settings.font`. The picker UI is gone.
- **Ramp-down only at punctuation.** `tokenize.ts` distributes `pauseWeight` to the 2 tokens *before* a punctuation. There is no `OUT` window — the reader snaps back to peak WPM on the very next word. The user explicitly removed the ramp-up.
- **Word layout uses `calc(var(--anchor-x) + 1ch)` for `.word-after`.** This only works correctly for monospace. An attempt to make it font-agnostic broke vertical alignment between the current word and peripheral context. The user vetoed the refactor. **Don't try again unless asked.**
- **`wpm` lives in `settings`, not local state.** Persists across refreshes. Session resume overrides it with the session's saved wpm so the user picks up at the same speed they left.
- **Punctuation pause slider is inverted.** Left = more pause (slower), right = less pause (faster). Implemented in `ChromeSlider`'s `invert` prop via `inner = min + max - value`.

## Defaults for first-time visitors

In `src/types.ts > DEFAULT_SETTINGS`:
- theme: `light`, font: `mono`, fontSize: `large`
- peripheral: on, animate: on, easePunct: on
- wpm: 300, punctMult: 1.45×, wordMult: 0.5×, periMult: 1.25×

To preview defaults in a tab that already has stored settings: `localStorage.removeItem('rsvp.settings')` then refresh.

## Key behaviors / gotchas

- **ORP anchor stability is the most important visual property.** The ORP letter must stay at the same screen X across word changes. Layout: `.word-before` right-aligns to anchor, `.word-orp` sits at anchor, `.word-after` starts at `anchor + 1ch`. Don't touch this without testing visually.
- **Peripheral words use measured edges of the current word** (`--word-left` / `--word-right` CSS vars set from `WordDisplay`'s `useLayoutEffect` Range measurement). Gradient masks fade them outward.
- **WPM panel hover-expand** lives in `Chrome.tsx` via `wpmHover` state + `.chrome-tl.expanded` CSS class. Sliders inside use shadcn Slider (`ui/slider.tsx`) with custom amber thumbs.
- **Scrub bar** appears below the paused hint, in the accent color, draggable when paused, fades during playback. Radix Slider handles its own arrow-key nav; the global keyboard handler in `App.tsx` bails when `e.target` has `role="slider"` so we don't double-step.
- **About modal** is a shadcn Dialog. Content is intentionally lowercase + measured ("dark library voice"). "Buy me a coffee" + Chrome Extension + GitHub links are placeholders.
- **localStorage keys:**
  - `rsvp.settings` → `Settings` object (theme, font, fontSize, wpm, peripheral, animate, easePunct, punctMult, wordMult, periMult)
  - `rsvp.session` → `{ text, index, wpm, updatedAt }` — for resume

## Reference docs in this repo

- `docs/PRD.md` — full PRD (context, locked decisions, design system, technical plan, verification, original Claude Design handoff prompt)
- `docs/design-chat.md` — the full conversation between the user and Claude Design that produced the original prototype. Read this for design intent and iteration history.
- `docs/claude-design-handoff-readme.md` — Claude Design's own bundle README

## V2 (not started)

Wrapping as a Chrome extension that uses an AI reader to extract article bodies from blogs/news and pipes them into the RSVP view. The user mentioned this as a possible later phase — don't build it preemptively.

## Style preferences (from observed feedback)

- The user wants restraint. No emoji unless asked. No banner comments, no "Phase 1: …" headers in code. Brief in chat, terse in code.
- The user reviews changes visually and corrects when something feels off — follow their feedback faithfully and revert quickly when asked.
- Domain registration: Porkbun or Namecheap, not GoDaddy (which over-prices short Latin names as "premium").
