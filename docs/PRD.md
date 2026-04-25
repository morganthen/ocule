# PRD: Ocule — Speed Reader SPA ("Dark Library")

**Name:** Ocule (wordmark typeset as **Oculè** with the grave accent; product name and domain use plain *Ocule*).
**Etymology:** from Latin *oculus*, "eye." Fits the ORP anchor concept — the app is about where the eye focuses.


## Context

A browser-only single-page app for speed reading pasted text using **RSVP (Rapid Serial Visual Presentation)** with an **ORP (Optimal Recognition Point)** anchor — one letter per word is visually highlighted so the eye locks onto a fixation point rather than saccading across each word. Popularized by Spritz (~2014); related to the "Bouma" / word-shape theory of reading.

**Motivation:** personal scratch-the-itch + UI craftsmanship project. No users yet, no business metric. The bar is *"feels great to use for 30 seconds"* — toy first, product later. A possible V2 wraps this as a Chrome extension that uses an AI reader to extract article bodies from blogs/news and pipes them into the RSVP view.

**Intended outcome:** a self-contained SPA that looks and feels like a quiet reading room — the kind of minimal, literary dark UI you'd want to show a designer friend. Not another generic "speed reading tool" webpage.

## Locked decisions

| Decision | Choice |
|---|---|
| Stack | **React + Vite**, TypeScript |
| Component base | **shadcn/ui** (Radix primitives + Tailwind), customized to match the dark-library design tokens |
| Styling | **Tailwind CSS** with CSS custom properties for theme tokens |
| Typography | **Monospace serif** (Monaspace Xenon → Berkeley Mono → IBM Plex Mono fallback) |
| Persistence | **localStorage** — resume last session offered on reload |
| Form factor | **Responsive, desktop-first** — keyboard-primary, touch-usable |
| Theme | **Dark default**, light mode toggle |
| Backend | **None** — pure static SPA |
| Target | Modern evergreen browsers only |

### Why shadcn/ui here
- We own the component source code (copy-paste, not `node_modules`) — every component can be restyled to match the dark-library aesthetic without fighting library defaults.
- Radix primitives give us accessible Popover (settings), Dialog, Slider, Switch, Toggle, and Tooltip for free — we'd otherwise hand-roll these and get keyboard/focus handling wrong.
- Tailwind's CSS variable system maps cleanly onto our dual-theme palette (we set the shadcn theme variables to point at our `--bg`, `--text`, etc., so shadcn components inherit the library aesthetic automatically).

## Core features (v1)

### 1. Paste → Read flow
- Landing view: narrow centered column, serif prompt *"Paste what you'd like to read"*, one textarea, no visible button until text is present.
- On paste + Enter (or Start button): enter full-screen reading view.
- If a prior session exists in localStorage: offer *"Resume where you left off"* (with preview of next word + progress %) alongside *"Start new"*.

### 2. RSVP word display
- Single word shown at a time, centered, ~40% from top (natural reading eye line).
- Word size: `clamp(3rem, 8vw, 7rem)`.
- **ORP anchor letter** is colored differently and the word is *positioned so the anchor letter stays in a fixed horizontal spot* across all words (Spritz-style — this is the core UX).
  - ORP selection algorithm:
    - 1 letter → letter 1
    - 2–5 letters → letter 2
    - 6–9 letters → letter 3
    - 10–13 letters → letter 4
    - 14+ letters → letter 5
- Word transitions: 30ms opacity fade. No horizontal slide (tires the eye).

### 3. Variable dwell time
- Base WPM sets baseline dwell (`60000 / WPM` ms per word).
- Multipliers:
  - Long words (>8 chars): `×1.4`
  - Words ending in `,` `;` `:`: `×1.6`
  - Words ending in `.` `!` `?`: `×2.2`
  - Paragraph break: extra 350ms pause
- Gives the text natural rhythm; huge feel improvement over fixed dwell.

### 4. Peripheral context toggle
- Off (default): only current word visible.
- On: previous word to the left (faded, ~40% opacity, ~40% size), next word to the right, same treatment. Cross-fade on transition, no slide.
- Toggle persists in localStorage.

### 5. Controls
| Input | Action |
|---|---|
| `Space` | Pause / resume |
| `Space` × 2 rapid | Catch-up: rewind 10 words, resume |
| `←` (tap) | Rewind 1 word |
| `←` (hold) | Scrub backward at 4× |
| `→` (tap) | Forward 1 word |
| `→` (hold) | Scrub forward at 4× |
| `↑` / `↓` | WPM ±25, live |
| `Esc` | Exit to paste view (progress saved) |
| Tap (mobile) | Pause / resume |
| Swipe left/right (mobile) | Rewind / forward |

### 6. Chrome (auto-hide)
- Hidden during active reading.
- Appears on mouse movement, fades after 2s idle.
- Top-left: current WPM (`"340 wpm"`)
- Top-right: settings icon → popover with peripheral toggle, theme toggle, font size
- Bottom: 1px progress sliver (always visible); expands on hover to show *"2m 14s remaining"*

### 7. Catch-up mode (zone-out recovery)
- Double-tap `Space` rewinds 10 words and auto-resumes.
- Visual cue: brief amber flash on the progress bar so the user sees it happened.

### 8. Light / dark mode
- Dark is default.
- Toggle in settings; persists in localStorage.
- Respects `prefers-color-scheme` on first visit.

## Design system

### Dark mode palette
```
--bg:           #14110F   (warm near-black, "candlelight paper")
--bg-elevated:  #1A1613
--text:         #E8E3DB   (soft off-white, never pure white)
--text-dim:     #8A7F72
--text-faded:   #5A524A   (peripheral words)
--orp:          #D4A574   (warm amber — lamplight, not error red)
--accent:       #6B8E7F   (quiet sage, used sparingly)
--rule:         #2A2420   (hairline dividers)
```

### Light mode palette
```
--bg:           #F5F1E8   (aged paper)
--bg-elevated:  #EDE7D9
--text:         #2A2520   (soft near-black)
--text-dim:     #6B6258
--text-faded:   #A89E8F
--orp:          #8B2E2E   (deep burgundy)
--accent:       #3E5D4E   (forest)
--rule:         #D4CDBE
```

### Typography
- Primary: `Monaspace Xenon` with fallback stack `"Berkeley Mono", "IBM Plex Mono", ui-monospace, monospace`
- UI labels: same family, smaller + tighter
- Weights: 400 body, 500 labels, 600 for the ORP letter

### Motion
- All transitions 30–150ms, easing `cubic-bezier(0.4, 0, 0.2, 1)`
- No bounces, no springs. Library-quiet.
- ORP letter is always at the same screen X position — words reflow around it, don't slide through it.

### Layout
- Paste view: `max-width: 640px`, centered, vertical padding `20vh` top
- Reader view: full-bleed, word centered with ORP pinned at roughly 42% of viewport width (left of center — matches natural fixation)

## Technical plan

### Project layout
```
src/
  App.tsx                  // route between paste + reader views
  components/
    ui/                    // shadcn primitives (customized): button, popover,
                           //   slider, switch, toggle, tooltip, textarea
    PasteView.tsx          // feature component using ui/textarea + ui/button
    ReaderView.tsx
    WordDisplay.tsx        // renders current word with ORP anchor positioning
    PeripheralContext.tsx  // prev/next faded words
    Chrome.tsx             // auto-hiding top/bottom UI
    SettingsPopover.tsx    // uses ui/popover + ui/switch + ui/slider
    ProgressBar.tsx
  hooks/
    useRSVP.ts             // tokenization + timing state machine
    useKeyboard.ts         // keybinding handler
    useLocalStorage.ts
    useAutoHide.ts         // for chrome
  lib/
    tokenize.ts            // text → word tokens with punctuation metadata
    orp.ts                 // ORP letter index calculation
    dwell.ts               // variable dwell time multiplier logic
    utils.ts               // shadcn's `cn()` class-merge helper
  styles/
    tokens.css             // CSS custom properties for both themes
    globals.css            // Tailwind directives + base layer
  main.tsx
index.html
tailwind.config.ts
components.json            // shadcn CLI config
vite.config.ts
```

### shadcn setup notes
- Initialize with `npx shadcn@latest init`. Choose: **TypeScript**, **Default** style, base color **Neutral** (we'll override via CSS variables), CSS variables **yes**, import alias `@/*`.
- Add only the components we use: `npx shadcn@latest add button textarea popover slider switch toggle tooltip`. Nothing else — keep `components/ui/` lean.
- In `styles/tokens.css`, map shadcn's theme variables (`--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, etc.) onto our dark-library palette so shadcn components inherit the aesthetic without per-component overrides. Our own semantic tokens (`--orp`, `--text-faded`) live alongside shadcn's.
- Override typography defaults: set Tailwind's `fontFamily.sans` to the monospace-serif stack so shadcn components (buttons, labels) match the reader.
- Component customizations live in `components/ui/*.tsx` directly — because shadcn gives us the source, we edit it. For instance, `button.tsx` gets smaller default padding and our `--accent` for the primary variant; `slider.tsx` gets a thinner track; `popover.tsx` gets a warm-paper background and no shadow (quiet, not floating).

### Key implementation notes
- **`useRSVP` hook** is the state machine: current index, playing/paused, WPM. Uses `requestAnimationFrame` driven timer (not `setInterval`) for precise dwell — schedules next word advance based on current word's computed dwell time.
- **ORP positioning**: render word as three spans (`before | orp | after`). Wrap in a flex container where the `orp` span is absolutely positioned at the fixation X; the `before` span right-aligns to it, the `after` span left-aligns from it. Result: anchor letter never moves.
- **Tokenization**: split on whitespace, preserve trailing punctuation on token so dwell logic can inspect it. Collapse `\n\n+` into paragraph-break markers (not displayed as words, just trigger pause).
- **Mobile gestures**: use pointer events, detect horizontal swipe >40px → rewind/forward. Single tap → toggle pause.
- **No analytics, no telemetry, no tracking** — fits the "toy + private" brief.

### Non-goals for v1
- No article extraction / URL paste (that's the V2 extension)
- No accounts / sync / multi-device
- No multiple saved sessions (just the single "last session")
- No export / bookmarks / highlights
- No AI summarization
- No comprehension testing

## Verification

1. **Build check**: `npm run dev` — Vite serves, no console errors.
2. **Paste flow**: paste a sample paragraph, press Enter, reader view appears, first word displays with ORP letter highlighted in amber.
3. **ORP anchor stability**: open reader, watch 20+ words go by — visually confirm the ORP letter stays at the same X coordinate on screen.
4. **Dwell rhythm**: paste a paragraph with varied punctuation — confirm audible/visible pauses at commas and periods feel natural, not mechanical.
5. **Keyboard**: test Space (pause), `↑`/`↓` (WPM changes live without jump), `←` hold (scrub rewind at 4×), `Esc` (exit, progress saved).
6. **Catch-up**: play, double-tap Space, confirm jump back 10 words + amber flash on progress bar.
7. **Peripheral toggle**: off shows only current word; on shows faded prev/next. Setting persists across reload.
8. **Theme toggle**: flip light/dark; colors update including ORP color. Setting persists.
9. **Resume**: refresh mid-read — landing shows *"Resume where you left off"* with correct next word.
10. **Mobile**: open in responsive mode (iPhone 14 viewport) — word scales down, tap pauses, swipe rewinds.
11. **Font fallback**: in devtools, block Monaspace Xenon — confirm fallback to Berkeley Mono / IBM Plex Mono / system mono still looks intentional.

## Claude Design handoff prompt

Once this plan is approved, paste the following into Claude Design to generate the SPA in one shot:

---

> Build a single-page speed-reading web app using **React + Vite + TypeScript + Tailwind CSS + shadcn/ui**. No backend, no build-time data, pure client-side, deployable as static files.
>
> **Component system:** Use **shadcn/ui** as the primitive layer. Initialize with `npx shadcn@latest init` (TypeScript, Default style, base color Neutral, CSS variables yes, `@/*` import alias). Add only these primitives: `button`, `textarea`, `popover`, `slider`, `switch`, `toggle`, `tooltip`. All shadcn components live in `src/components/ui/` — edit them directly to match the design (smaller padding on buttons, thinner slider track, warm-paper popover background with no shadow, monospace-serif font family everywhere, and shadcn's theme variables `--background`/`--foreground`/`--primary`/`--muted`/`--border`/`--ring` remapped to our palette below so all shadcn components inherit the dark-library aesthetic automatically).
>
> **Concept:** RSVP (Rapid Serial Visual Presentation) — shows pasted text one word at a time at a user-controlled WPM, with one letter (the ORP — Optimal Recognition Point) visually anchored at a fixed horizontal position so the eye doesn't have to saccade. Spritz-style.
>
> **Aesthetic: "dark library" — minimalist, literary, classy.** Think a quiet reading room at night, not a productivity app. Reference: iA Writer focus mode, Readwise Reader, Kindle Paperwhite at low backlight. Restrained, warm, typographic.
>
> **Typography:** monospace serif. Primary `Monaspace Xenon`, fallback stack `"Berkeley Mono", "IBM Plex Mono", ui-monospace, monospace`. Load Monaspace from GitHub's CDN or via `@fontsource` if available.
>
> **Palettes (use CSS custom properties, theme toggle via `data-theme` attribute on root):**
>
> Dark (default):
> - `--bg: #14110F` (warm near-black)
> - `--bg-elevated: #1A1613`
> - `--text: #E8E3DB` (soft off-white, never pure white)
> - `--text-dim: #8A7F72`
> - `--text-faded: #5A524A` (peripheral words)
> - `--orp: #D4A574` (warm amber, lamplight — NOT red)
> - `--accent: #6B8E7F` (quiet sage)
> - `--rule: #2A2420`
>
> Light:
> - `--bg: #F5F1E8` (aged paper)
> - `--bg-elevated: #EDE7D9`
> - `--text: #2A2520`
> - `--text-dim: #6B6258`
> - `--text-faded: #A89E8F`
> - `--orp: #8B2E2E` (deep burgundy)
> - `--accent: #3E5D4E` (forest)
> - `--rule: #D4CDBE`
>
> **Two views:**
>
> 1. **Paste view:** centered column, max-width 640px, ~20vh top padding. Quiet serif prompt *"Paste what you'd like to read"*. Single textarea (transparent background, `--text` text color, no border except a 1px `--rule` bottom line). "Start" button appears only after text is present, small and unobtrusive — the real entry is pressing Enter (Cmd/Ctrl+Enter from the textarea). If localStorage has a prior session, show a secondary row: *"Resume where you left off — [next word preview] · 34% read"* with a link to resume and a link to start new.
>
> 2. **Reader view:** full-bleed `--bg`. Single word centered, positioned ~40% from top. Word size `clamp(3rem, 8vw, 7rem)`. **The ORP anchor letter stays at a fixed horizontal screen position** (roughly 42% of viewport width, slightly left of center). Render word as three spans: `before | orp | after`; ORP span is absolutely positioned at the anchor X, `before` right-aligns to it, `after` left-aligns from it. Word transitions are a 30ms opacity cross-fade — NEVER a horizontal slide.
>
> **ORP letter index** (for a word of length N):
> - N=1 → 0
> - N=2..5 → 1
> - N=6..9 → 2
> - N=10..13 → 3
> - N≥14 → 4
>
> **Peripheral context (toggle-able):** when on, show previous word to the left and next word to the right of the current word, at ~40% opacity, ~40% size, same monospace. Cross-fade on transition. Persist toggle in localStorage.
>
> **Variable dwell timing (critical for feel):** base `ms = 60000 / WPM`. Multiply by:
> - 1.4 if word length > 8
> - 1.6 if word ends with `,` `;` `:`
> - 2.2 if word ends with `.` `!` `?`
> - Additional 350ms pause on paragraph breaks (empty line in source → marker token, not displayed)
>
> Use `requestAnimationFrame` for the timer, not `setInterval` — each word schedules the next advance based on its own computed dwell.
>
> **Keybindings:**
> - `Space` → pause/resume
> - Double-`Space` (within 400ms) → rewind 10 words and resume (the "catch-up" if user zoned out), with a brief amber flash on the progress bar
> - `←` tap → back 1 word; `←` hold → scrub backward at 4× speed
> - `→` tap → forward 1 word; `→` hold → scrub forward at 4× speed
> - `↑` / `↓` → WPM ±25, live (no jump)
> - `Esc` → exit to paste view, save progress
>
> **Mobile:** responsive. Single tap → pause/resume. Swipe left/right >40px → rewind/forward 1 word.
>
> **Auto-hiding chrome** (hidden during active reading, appears on mouse movement, fades after 2s idle):
> - Top-left: current WPM display, e.g. `"340 wpm"`, in `--text-dim`
> - Top-right: small gear icon → popover with: peripheral context toggle, theme toggle (light/dark), font size slider (small/medium/large)
> - Bottom: 1px `--rule` progress sliver, always visible (even during reading); on hover it expands to 2px and shows time-remaining text like `"2m 14s remaining"` above it
>
> **Persistence (localStorage keys, JSON):**
> - `rsvp.session` → `{ text, index, wpm, updatedAt }`
> - `rsvp.settings` → `{ theme, peripheral, fontSize }`
>
> **Motion:** all transitions 30–150ms, easing `cubic-bezier(0.4, 0, 0.2, 1)`. No springs, no bounces. The app should feel quiet.
>
> **What NOT to include:** no accounts, no backend, no analytics, no telemetry, no URL-fetch/article-extraction, no AI, no sharing, no multi-session library, no export, no comprehension quizzes. Just the reader.
>
> **Deliverable:** a single Vite React TypeScript project with Tailwind + shadcn configured. Structure: feature components `PasteView`, `ReaderView`, `WordDisplay`, `PeripheralContext`, `Chrome`, `SettingsPopover`, `ProgressBar` in `src/components/`; shadcn primitives in `src/components/ui/`; hooks `useRSVP`, `useKeyboard`, `useLocalStorage`, `useAutoHide` in `src/hooks/`; lib modules `tokenize.ts`, `orp.ts`, `dwell.ts`, `utils.ts` (shadcn `cn` helper) in `src/lib/`. Include `tailwind.config.ts`, `components.json`, a tokens CSS file mapping shadcn theme variables to our palette, and a minimal global stylesheet. Production build (`npm run build`) must work as a static deploy (Netlify/Vercel/GitHub Pages).
>
> **Visual bar:** it should look like something you'd screenshot and post on Are.na, not a bootcamp project. Restraint over features. Typographic precision over decoration.

---
