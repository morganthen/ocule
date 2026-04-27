# Oculé handoff API

How a Chrome extension (or any caller) hands an article to Oculé to read.

The web app exposes three transports. The extension can use whichever fits its
flow; all three end up in the same dispatcher.

## Behavior

- If the user has **no saved session**, the reader auto-starts on the incoming text.
- If the user **has a saved session**, the paste view is shown with the new
  article pre-filled in the textarea and a resume strip below referencing the
  old session. The user explicitly chooses to resume the old reading or start
  the new one (with a confirm dialog protecting destruction of the saved
  session).

## Transport 1 — URL query parameter

Open `https://ocule.app/?text=<URI-encoded text>`.

```ts
const url = `https://ocule.app/?text=${encodeURIComponent(article)}`
chrome.tabs.create({ url })
```

- **Use for:** short snippets, bookmarklets, share-target buttons.
- **Limit:** ~8 KB before hosts (Cloudflare, Netlify, Vercel) start
  rejecting with 414 / 431. The dev server has been raised but production
  hosts are not under your control.
- **Lifecycle:** Oculé reads the param synchronously on first render, then
  strips it via `history.replaceState` so a refresh doesn't re-trigger.

## Transport 2 — `localStorage` inbox

The extension writes to the page's `localStorage` *before* React mounts. This
requires a content script that runs at `document_start` on `ocule.app` (or
your dev origin).

```ts
// content-script.ts, run_at: "document_start"
localStorage.setItem('rsvp.inbox', JSON.stringify({
  text: article,
  source: location.href,   // optional, currently unused
  ts: Date.now()           // optional, currently unused
}))
```

Then the extension navigates the page (or opens a tab pointed at Oculé). On
mount, Oculé reads `rsvp.inbox`, deletes it, and dispatches the article.

- **Use for:** larger payloads where URL length is risky.
- **Constraint:** must be written *before* Oculé's React tree mounts. A
  `document_start` content script meets this; `document_idle` does not.
- **Storage limit:** browser-imposed `localStorage` quota (~5 MB origin-wide
  in Chrome). Plenty for any article.

## Transport 3 — `window.postMessage`

After Oculé has loaded, post a message from a content script (or any frame).

```ts
// content-script.ts, run_at: "document_idle"
window.postMessage({
  type: 'ocule:read',
  text: article,
  source: location.href     // optional
}, location.origin)
```

Oculé's listener accepts any message of shape `{ type: 'ocule:read', text:
string }`. Source/origin is not currently validated — for V1 dogfooding the
shape match is enough.

- **Use for:** content scripts that already have a handle on the Oculé tab
  and want to deliver text post-load (e.g., user clicks the extension icon
  while on an article page; extension extracts text, opens Oculé in a new
  tab, then posts after the new tab signals ready).
- **Timing:** Post any time after the page is loaded. If Oculé isn't ready
  yet, the message is missed silently — there's no buffer. The simplest
  recipe is to wait for the new tab to fire its `load` event before posting.
- **Race-safe pattern:** if you can't guarantee load order, write the
  `localStorage` inbox first *and* post the message. Oculé will dedupe by
  consuming whichever arrives first.

## Choosing a transport

| Scenario | Recommended |
|---|---|
| Quick share-link / bookmarklet (text < 4 KB) | URL param |
| Extension content script that wraps text and opens a tab | localStorage inbox (write at `document_start`) |
| Extension that opens Oculé and pushes text from a different content script | `postMessage` |
| Want to be most robust against load timing | Combine localStorage inbox + postMessage |

## Web app entry points

The handoff lives in `src/App.tsx`:

- `useState` initializer reads URL param + `rsvp.inbox` synchronously.
- A mount effect strips the URL param, deletes the inbox key, and
  auto-starts when no session.
- A `message` event listener dispatches `ocule:read` payloads.
- `acceptHandoff(text)` is the single dispatcher — it routes through
  `setPendingHandoff` (with-session) or `onStart` (no-session).

If you change any of these, also update this doc.
