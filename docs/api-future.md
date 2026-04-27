# Adding a backend later — options ranked

A reference for "Oculé needs an API now" decisions. The trigger is most
likely going to be one of: payments (Stripe webhook), AI features that need
a server-held secret key, or auth.

The current architecture is a Vite SPA on Vercel with no backend. That's
correct for what the app does today. **Don't refactor preemptively.** When
the trigger comes, this doc says what to do — in the order to consider it.

## Option 1: Vercel Serverless Functions in this repo

**Cost: tiny. ~30 lines + a config tweak. No framework change.**

Drop a TypeScript file at `/api/foo.ts` next to your existing Vite project.
Vercel auto-detects the `/api` directory and serves each file as a Node
serverless function. Your existing Vite SPA stays exactly as-is.

The function gets `request` / `response` (Express-ish API) or you can use
the Edge Runtime for faster cold starts. You write the function the same way
you'd write any backend handler — connect to Stripe, verify a webhook, hit a
database, return JSON.

**Caveat to remember:** your current `vercel.json` rewrites `/(.*)` to
`/index.html`. Once you add `/api/*`, you have to exclude it:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

Otherwise requests to `/api/foo` get rewritten to the SPA and your function
never runs.

**When to pick this**

- One or two endpoints. Webhook receivers. Light AI proxy ("call OpenAI on
  the user's behalf with my secret key").
- You don't want to learn a new framework.
- The API is small enough that "it lives in the same repo" is a feature,
  not a coupling problem.

This will be the right answer for Oculé's first backend need, almost
certainly.

## Option 2: A separate tiny backend (Worker / Hono / Express)

**Cost: medium. Separate repo, separate deploy, separate auth model.**

A standalone backend somewhere — a Cloudflare Worker, a single-file Hono app
on Vercel or Fly, an Express server, whatever. CORS-allows your frontend
origin, returns JSON.

The frontend talks to it via `fetch('https://api.ocule.app/...')` instead
of `/api/...`.

**When to pick this**

- The backend's security posture is meaningfully different from the
  frontend's (e.g., it processes sensitive data, you want a minimal
  TCB you can audit on its own).
- The backend has dependencies or runtime needs that don't fit the
  serverless function model (long-running connections, large memory,
  background workers).
- You want to keep the frontend repo lean and auditable. "No backend code
  in the SPA repo" can be a deliberate boundary.
- You're building something where the backend is the product and the
  frontend is one of several clients.

For Oculé, you'd reach for this if you ever build, say, a server-side
article extraction pipeline that other clients (mobile, CLI) might use too.

## Option 3: Refactor to Next.js

**Cost: large. Rewriting the existing CSR setup, learning the framework,
accepting a heavier toolchain.**

Convert the entire app to a Next.js project. File-based routing, server
components, API routes built in.

**When to pick this**

- You also want SSR (server-side rendering) for SEO. Speed-reader landing
  pages don't need this.
- You want server components for data fetching with first-paint streaming.
  Oculé doesn't fetch data on first paint.
- The set of pages keeps growing and file-based routing genuinely helps.
  Static `/`, `/privacy`, maybe `/about` doesn't qualify.
- You want auth that benefits from server-side cookies and middleware.
  Probably overkill for a tip-jar product.

For Oculé specifically: **you will probably never need this.** The cost is
real and the marginal benefit over Option 1 is mostly imaginary unless one
of the bullets above is genuinely true. If you find yourself wanting Next
because "everyone uses Next," that's not a reason — that's a vibe.

## How to choose, in practice

When you reach for a backend, ask in order:

1. Could I solve this with a single serverless function in `/api/*`?
   → Option 1.
2. Does the backend genuinely need to live separately for security or
   architectural reasons?
   → Option 2.
3. Do I actually need SSR / RSC / file-based pages?
   → Option 3.

The answer is almost always (1). Build it that way. Reconsider when (1) is
genuinely failing you, not before.

## Migration notes (for future you)

If you go with Option 1:

- The folder structure stays the same. `/src` is still the SPA. `/api` is
  new and parallel.
- Your `tsconfig.json` and `package.json` already cover both — Vercel
  handles the build for `/api/*` automatically.
- Test functions locally with `vercel dev` (install `vercel` CLI). It runs
  the SPA *and* the functions on one local origin so CORS is a non-issue.
- Secrets live in Vercel's environment variables, not in the repo. Read
  them via `process.env.STRIPE_SECRET_KEY` etc. inside the function. They
  are not exposed to the frontend bundle.
- Webhook signature verification (Stripe, GitHub, etc.) requires the **raw**
  request body, not parsed JSON. The function handler receives the raw
  body via the `request` object — read about Vercel's `request.text()`
  pattern when you build this.

If you go with Option 2 or 3, this doc is the wrong place — by then the
decision is bigger than a folder layout note. Reread `payments-learning.md`
for the security side and start from architecture first.

## Note to future Claude

When the user comes back with "OK I need to add an endpoint," default to
Option 1. Don't propose Next.js. Don't suggest a separate backend service.
Build the smallest valid thing in `/api/*` and update `vercel.json`'s
rewrite to exclude it.
