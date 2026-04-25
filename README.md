# Oculé

A quiet speed reader for the browser. Paste any text, watch it stream past one word at a time, and let your eye rest on a single fixation point — the way reading actually feels when it's working.

The name is from Latin *oculus*, "eye." The wordmark is typeset as **Oculé** with the grave accent.

## What it is

Oculé presents pasted text using **RSVP** (Rapid Serial Visual Presentation) — a single word at a time, centered on screen — with an **ORP** (Optimal Recognition Point) anchor. One letter of every word is highlighted in amber and pinned to a fixed horizontal position so the eye stops saccading across the line and just receives words as they arrive. Spritz-style, but quieter.

A few touches that make it pleasant to actually use:

- **Eased punctuation pauses.** Sentences slow down into a comma or period and accelerate back out, so the reader breathes instead of slamming into stops.
- **Dark-library aesthetic.** Warm near-black, lamplight amber, monospace serif. Light mode is aged paper. No app chrome competing for attention.
- **Optional ambient soundscape.** Looping rain / forest / noise / binaural to settle into focus.
- **Live-tunable.** Peripheral context, font, word size, peripheral size, dwell weighting, punctuation easing — all adjustable while reading.
- **Resume where you left off.** Everything persists in `localStorage`. No accounts, no telemetry, no backend.
- **Keyboard-primary.** Space to pause, double-tap to rewind 10, arrows to scrub or change WPM, Esc to exit.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # static deploy bundle in dist/
```

Pure static SPA — deploy to any static host.

## Stack

Vite, React, TypeScript, Tailwind CSS, shadcn/ui (Radix primitives), CSS custom properties for dual themes. No backend.

## Status

A portfolio project, kept for fun. It stays free, runs client-side only, and I keep tinkering with it as the mood strikes. A possible V2 wraps it as a Chrome extension that pulls article bodies from blogs and news into the reader — if I get to it, I get to it.

## License

MIT.
