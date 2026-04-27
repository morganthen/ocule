# Payments — learning notes

A working doc for the eventual "buy me a coffee" feature. The goal here is
**you learning**, not me generating code. So this file captures architecture,
security, and the questions you should be able to answer for yourself before
you ship anything that touches money.

## Where we left off

You asked: BMC, PayPal, or Stripe? I said pick **one**, not a combination.

| Option | Fee | Branding | Effort | When |
|---|---|---|---|---|
| Buy Me a Coffee | 5% + processor fee | "Buy me a coffee" UI, social proof | ~5 min | Tip-jar feel, you don't want to build anything |
| Stripe Payment Link | 2.9% + 30¢ | Plain Stripe checkout | ~5 min | Lower fees, you're OK with bare checkout |
| PayPal.me | 3.49% + 49¢ | PayPal redirect | ~5 min | Audience skews older/international |

For Oculé's "buy me a coffee" button, **BMC alone** is the obvious pick. We're
not even close to a scale where the 2.1% fee delta matters, and BMC's UX
removes a lot of friction.

But you want to *learn* this, not just paste a link. So the rest of this doc
is for the path where you eventually outgrow the third-party tip page and
build your own checkout — which is exactly the path that teaches the most.

## Two architectures, two skill ceilings

### Architecture A: hosted link (BMC, Stripe Payment Links)
You don't run any backend. You hand your users a URL, they pay on someone
else's domain, money lands in your bank account.

- **What you build**: an `<a href="https://...">` tag.
- **What you learn**: nothing about payments. Ship it, forget about it.
- **When to use**: every project until the payment flow becomes part of the
  product (subscriptions, gating, complex pricing, etc.).

### Architecture B: integrated checkout
You run a backend. The browser asks your backend to create a checkout
session, your backend talks to Stripe (or whoever) using a secret API key,
returns a session URL or token, and the browser redirects or mounts a
payment form. After payment, Stripe pings your backend via webhook to tell
you what happened.

- **What you build**: a backend endpoint, a webhook receiver, a database
  table for "who paid what when," idempotency handling, and a frontend that
  initiates the flow.
- **What you learn**: most of the load-bearing concepts in modern
  payments. This is the one that teaches.
- **When to use**: when you need to know *who* paid, *what for*, and react
  to it (unlock a feature, send an email, write to your database, etc.).

For Oculé you don't need Architecture B. But it's the architecture worth
spending a Saturday on, even if you scrap the result, because it appears
verbatim in every SaaS, every commerce app, every paid-feature flow you'll
ever write.

## Concepts to be able to explain before writing code

Not a tutorial — questions you should be able to answer, ideally without
looking at docs. If you can't, that's the next thing to read about.

### Architecture / system design

1. **Why must the secret key live on the server, never the browser?** What
   would actually go wrong if you put `sk_live_...` in your React bundle?
   (Hint: it's not just "people will see it." Think about what they could
   *do* with it.)

2. **What is a webhook and why does Stripe use them instead of having your
   frontend tell the backend "I paid"?** What attack does the webhook
   pattern prevent that the naive "trust the client" pattern enables?

3. **What does it mean for a webhook handler to be idempotent?** Why does
   Stripe deliver the same webhook event multiple times sometimes, and what
   happens if your handler isn't ready for that?

4. **What is a "session" in Stripe Checkout, and why doesn't the URL it
   returns have your customer's email or amount in plain text?** What's the
   trade between "create the session server-side and redirect" vs. "build a
   form that posts to Stripe directly"?

5. **What happens between a user clicking "pay" and money landing in your
   bank?** Trace it: card network, issuer, acquirer, payment processor,
   your account. You don't need to memorize this, but knowing the steps
   makes Stripe's API names stop sounding arbitrary.

### Security

1. **HTTPS everywhere** — why is it not optional for any page in a payment
   flow, even pages that don't touch the card directly? Look up "session
   hijacking" and "mixed content."

2. **PCI compliance, in one paragraph** — what is it, what scope are you in
   if you use Stripe Checkout (hosted) vs. Stripe Elements (your domain),
   and what would you have to do if you collected the card number directly?
   The answer to the third one is "a lot" — knowing why is the lesson.

3. **CSRF on payment-initiating endpoints** — if your backend has a `POST
   /create-checkout-session` route, what stops a malicious site from making
   logged-in users hit it? What's the difference between this and the
   webhook problem?

4. **Webhook signature verification** — Stripe signs every webhook with
   your endpoint secret. If you skip verification, what attacks become
   trivially possible? Why is the raw body (not parsed JSON) what you have
   to verify against?

5. **Refunds, disputes, fraud** — these are part of payments, not
   afterthoughts. What's a chargeback? What's the difference between a
   refund and a dispute? Why might you not want to issue automatic refunds
   from a webhook?

6. **Storing card data** — short version: don't. Long version: under what
   circumstances would you ever need to, and what changes legally if you
   do?

### Operational

1. **Test mode vs. live mode** — Stripe gives you a separate set of keys
   for testing. What's the workflow for not accidentally charging real
   cards during dev?

2. **Logs and observability** — when a payment "didn't go through," where
   do you look? Stripe dashboard, your backend logs, your webhook delivery
   log, the user's email. Map the failure modes.

3. **Reconciliation** — once a month, how do you confirm that the money in
   your bank matches the events in your database? Why is this not optional
   for any business that takes more than ~5 payments a day?

## Suggested learning path

You don't have to do these in order, but this is what I'd do.

### Week 1 — read, don't build

- Stripe's [Atlas guides](https://stripe.com/atlas/guides) and
  [Payments 101](https://stripe.com/docs/payments). The "Payments" section
  alone is the best free curriculum on payments architecture.
- Read about HTTPS / TLS at the level of "what does the certificate
  prove" and "what's a man-in-the-middle." Cloudflare's blog is good for
  this.
- Read one good post on PCI scope. The TL;DR-with-table version on
  Stripe's docs is sufficient for now.

### Week 2 — build the cheapest-possible toy

A standalone repo with:

- A backend endpoint that creates a Stripe Checkout session.
- A webhook handler that verifies signatures and writes to a SQLite table.
- A frontend with a single "pay $1" button.

Use Stripe **test mode**. Charge yourself test cards. Refund yourself.
Trigger a dispute (Stripe lets you simulate this).

The whole thing is maybe 200 lines of code total. Don't worry about
production deploys, don't add a database ORM, don't make it pretty. The
point is to feel the request flow.

When you can re-create this from scratch without looking, you've internalized
Architecture B.

### Week 3 — break it on purpose

- Send a fake webhook to your endpoint without the signature header. Does
  your code reject it?
- Replay a webhook you've already processed. Does your code handle the
  duplicate, or does it create two database rows for the same payment?
- Comment out HTTPS locally and use ngrok with HTTP. Does Stripe even let
  the webhook through? (It won't.) What does the error message teach you?
- Hard-code your test secret key in the frontend bundle. What happens if
  someone uses it from outside your domain? Try it.

This is where the security concepts become real instead of abstract. You
learn more from one broken integration than from ten read-throughs of the
docs.

### Week 4+ — the real thing for Oculé

Start with the BMC link. Treat it as a placeholder. When/if there's a
reason to take payments directly (Pro tier, subscriptions, whatever), the
toy from Week 2 is your starting point.

## Questions to bring back to this doc when we resume

When you sit down to actually wire payments into Oculé, the open questions are:

1. Is this a one-off tip or recurring (e.g., "Pro" tier)?
2. If recurring: per-user accounts? Then you need auth, then you need a
   user table, then this is a much bigger project than the rest of Oculé.
3. If one-off only: BMC is genuinely the right answer. Don't talk yourself
   out of it.
4. What's the scope of "knowing who paid"? For a tip jar: nothing — you
   don't need a user record. For unlocking features: you need an identity
   to attach the unlock to.

The architecture you need depends entirely on the answer to (4). If you can
honestly say "I don't need to remember anything about the payer," use a
hosted link and stop reading.

## Resources

- **Stripe docs** ([stripe.com/docs](https://stripe.com/docs)) — the gold
  standard. Their "API Reference" doubles as a payments architecture
  textbook.
- **PCI SSC** ([pcisecuritystandards.org](https://www.pcisecuritystandards.org/))
  — the actual PCI DSS document. Skim it once just to know what's in it.
- **OWASP** ([owasp.org](https://owasp.org/)) — for the broader web
  security context. The Top 10 list is the floor for any backend that
  takes user input, not just payment endpoints.
- **Patrick McKenzie's "Falsehoods Programmers Believe About Prices"**
  (search for it) — the kind of detail-blindness payments will punish.
- A single book, if you read books: *Designing Data-Intensive Applications*
  (Kleppmann) — not specifically about payments, but the chapters on
  reliability, consistency, and idempotency are exactly what payment
  systems are made of.

## Note to future Claude (and future you)

When the user comes back to this file, **do not** open a tutorial and start
generating code. They've explicitly said they want to learn this themselves.
The right move is to answer specific questions, point to docs, and review
their code when they bring it.
