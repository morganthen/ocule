# SEO + the eventual Next.js refactor

A reference for the "I want this to be findable in search and I want a blog
someday" decision, plus where we landed.

## The decision

**Eventual destination: Next.js.** Reasons:

- Solo maintainer with existing Next.js experience — the framework's quirks
  aren't a learning cost.
- Likely future features that benefit from server actions / proper backend
  routes: bookmarks, accounts, payments, AI summaries, etc.
- App Router's file-based routing is genuinely pleasant for a growing set
  of pages (landing, blog, privacy, eventually pricing/auth).

**For now: stay on Vite.** The app is a fun side project, the reader
itself doesn't need indexing, and the cost-benefit of a full refactor
isn't there yet.

The trigger to actually refactor:

- You decide to write more than two or three blog posts, OR
- You add a feature that needs server actions (bookmarks, accounts,
  payments), OR
- The Vite SPA's "no real HTML at any URL" starts hurting search ranking
  measurably.

Don't refactor preemptively. The current architecture is correct for
what's built today.

## What's been done in the meantime

The marketing/landing concern is partially solved with hand-crafted
metadata on `index.html`:

- Real `<title>` and `<meta name="description">`.
- Canonical URL pointing to `https://ocule.app/`.
- Open Graph tags (title, description, image, type, locale) so links to
  Oculé on Slack / LinkedIn / Discord render with a proper preview card.
- Twitter Card tags (`summary_large_image`).
- JSON-LD structured data (`WebApplication` schema) so Google understands
  the page's purpose at indexing time.
- `theme-color` for browser chrome on mobile.

These ship in `dist/index.html` at every route (because of the
`vercel.json` rewrite). They don't make individual blog-post pages
indexable — they just make the *site* indexable as a single product page.

**Still needed**: an `og.png` image at the public root so the OG/Twitter
preview cards actually render an image. Suggested: 1200×630px, "oculé"
wordmark centered, dark library palette, ORP letter highlighted in amber.

## What this gets you

- Slack / LinkedIn / Twitter / iMessage previews look intentional.
- Google can index the home page with a proper title and description.
- Searches for "Oculé" or "Oculé speed reader" will eventually surface
  the site (as Google re-crawls).

## What this doesn't get you

- Per-post meta tags for blog content (would need pre-rendering or a
  framework).
- Ranking for terms like "speed reading," "RSVP reader," "ORP," etc.
  Beating established sites for those generic terms requires real content
  — articles written about the topic, with the meta tags to match —
  hosted on indexable URLs.
- Server-side anything (auth, payments, bookmarks).

## React Router does not help SEO

Common confusion: adding `react-router-dom` to a Vite SPA does not change
what crawlers see. The HTML is still empty (`<div id="root">` plus a JS
bundle). React Router is a client-side ergonomic — it lets you build
multiple in-app "pages" without remounting the app, but the URLs still
serve the same empty HTML.

(Aside: "React Router 7" is something different — a full SSR/SSG
framework, basically a Next.js competitor. If you ever pick that, you're
picking a framework, not a router.)

The thing that helps SEO is **delivering real HTML for each URL**.
That's a different problem entirely.

## Three options that actually fix SEO (when you're ready)

### Option A: Vike (formerly vite-plugin-ssr) + MDX

Vite-native. Pre-renders each route to real HTML at build time. Supports
SSG and SSR. MDX integration for blog posts.

- Effort: a focused weekend.
- Existing components mostly survive — slot them into Vike's render
  entrypoint.
- Output: real HTML at every route. Crawlers see the full content.
- Stays on Vite, stays on Vercel, no new deploy story.

### Option B: Hybrid — Vite SPA at `/`, Astro at `/blog`

Astro is purpose-built for content-first sites. Ships zero JS by default.

- Effort: medium. Two projects, two builds.
- Best authoring experience for a content-heavy blog.
- Keeps the reader app completely untouched.

### Option C: Refactor to Next.js — *the chosen long-term path*

- Cost: large up front, but pays off if/when other Next.js features
  become useful (server actions, server components, middleware, full auth).
- Marketing pages, blog posts, the reader app, and any future API all
  live in one project with one mental model.
- File-based routing with App Router. MDX integration via `next-mdx-remote`
  or `@next/mdx`.

## When to actually do the Next.js refactor

Refactor when *at least two* of these become true:

1. You want to write blog posts and have them indexed individually.
2. You're building a feature that needs server actions or a database.
3. You want proper auth (session cookies, middleware-protected routes).
4. The marketing page needs SSR'd content (testimonials pulled from a CMS,
   dynamic OG images per share, etc.).

Single trigger usually means a smaller solution exists. Two or more
triggers means refactoring beats accumulating ad-hoc fixes.

## Migration sketch (for future you)

When the refactor day comes, this is roughly the path:

1. **Scaffold a new Next.js app** in a sibling directory or branch.
   App Router. TypeScript. Tailwind already matches the existing stack.
2. **Move the reader UI verbatim**: the current `App.tsx`, hooks, and
   components are framework-agnostic enough to drop into a single
   `app/(reader)/page.tsx` route. The `useRSVP` hook, `tokenize`,
   `dwellMs`, all the components — none of them know they're in Vite.
3. **Recreate the routing**: `app/page.tsx` for the reader, `app/privacy/page.tsx`
   for privacy, `app/blog/[slug]/page.tsx` for blog posts.
4. **Move CSS**: `globals.css`, `tokens.css`, `components.css` go under
   `app/` or `styles/`. Tailwind config stays.
5. **Replace the URL handoff with a route**: the `?text=` param can stay
   the same. The localStorage and postMessage transports continue to work.
   Confirm with the extension repo that nothing breaks.
6. **Per-route metadata**: replace the hand-crafted `index.html` block
   with Next's `metadata` exports per route — landing page gets one set,
   each blog post gets its own.
7. **Generate `og.png` dynamically** if you want per-post share cards
   (Next has a built-in `ImageResponse` for this).
8. **Wire up the blog**: MDX files in `content/posts/` (or wherever),
   either via `@next/mdx` or `contentlayer`. Pre-rendered at build time.
9. **Decommission `vercel.json`**: not needed anymore — Next handles
   routing natively.

The whole thing is probably a long weekend of work, less if you're not
also redesigning anything. The reader's actual logic doesn't change.

## Note to future Claude

If the user comes back asking "should we refactor to Next.js now?", check
the trigger conditions above. If they're not met, push back. If they are,
proceed but treat the existing reader as the source of truth — don't
"improve" the RSVP logic, the tokenizer, the design tokens, or anything
else during the migration. Move it; don't rewrite it. Design choices in
this codebase are deliberate (see `CLAUDE.md`).
