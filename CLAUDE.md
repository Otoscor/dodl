# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project Overview

**dodl** is a Korean healthcare/supplement **mini e-commerce prototype**. It is a
mobile-first web app (fixed 430px-wide container) covering the full shopping flow:
product catalog → cart → checkout → orders (cancel/return/exchange) → virtual wallet.

It is **demo-grade**, not production: there are no real user accounts (data is scoped
to an anonymous session cookie), payments run against a seeded **virtual wallet** (no
payment gateway), and the database is a local seeded SQLite file. All UI text is Korean.

## Tech Stack

- **Next.js 16.2.9** — App Router (React Server Components)
- **React 19.2.4**
- **TypeScript 5** — strict mode; path alias `@/*` → `src/*`
- **Tailwind CSS 4** — via `@tailwindcss/postcss`
- **better-sqlite3 12** — embedded SQLite (synchronous); listed under
  `serverExternalPackages` in `next.config.ts`
- **uuid 14** — session id generation
- Dev tooling: ESLint 9 (`eslint-config-next`), Puppeteer 25 (screenshot script)

`next.config.ts` also allows remote images from `images.unsplash.com`.

## Commands

```bash
npm run dev        # dev server → http://localhost:3000
npm run build      # production build
npm run start      # run production build
npm run lint       # ESLint
npm run sync-docs  # copy public/docs/*.html design docs into docs/
```

`scripts/capture-screens.mjs` (Puppeteer) captures screenshots of the running app.

## Environment Setup

Auth requires two env vars in **`.env.local`** (not committed):

```
AUTH_USERS=aubrey:aubrey111!          # comma-separated id:password pairs
AUTH_SECRET=dodl-k9x2mQ8pLrN5vTjY     # arbitrary secret stored in the dodl_auth cookie
```

- `AUTH_USERS` — `id:password` pairs separated by commas, e.g. `a:pw1,b:pw2`.
- `AUTH_SECRET` — any non-empty string. Stored verbatim in the `dodl_auth` cookie and
  compared on every request.
- **Without both set, the middleware redirects every route to `/login` and login always fails.**
- **Restart the dev server after editing `.env.local`** — Next.js only reads env at boot.
- The login route un-escapes `\!` → `!` to work around a Vercel proxy quirk, so passwords
  containing `!` work correctly.
- Never commit real secret values; keep them in `.env.local`.

## Authentication Flow

Cookie-based, no real account system. There is **no logout endpoint** (clear cookies manually).

- **`src/middleware.ts`** — guards all routes except `/login`, `/api/auth/*`,
  `_next/static`, `_next/image`, `favicon.ico`, and `docs/`. Compares the `dodl_auth`
  cookie against `AUTH_SECRET`; redirects to `/login` on mismatch.
- **`src/app/api/auth/login/route.ts`** (POST) — validates `{ id, password }` against
  `AUTH_USERS`. On success sets two httpOnly cookies: `dodl_auth` (7 days) and
  `dodl_session` (30 days).
- **`src/app/login/page.tsx`** — client login form → POST `/api/auth/login` → redirect `/`.
- **`src/lib/session.ts`** — `getSessionId()` reads/creates the `dodl_session` UUID cookie.
  All cart, order, and wallet data is **scoped to this session id**.

## Directory Structure

```
src/
  app/
    (commerce)/          # route group for the shopping UI
      layout.tsx         #   wraps routes with CartProvider + BottomTabBar
      home/              #   landing hub (banners, categories, featured)
      products/          #   listing  +  [productId]/ detail (options, SKUs, reviews)
      cart/              #   cart management
      checkout/          #   address + wallet payment
      orders/            #   history  +  [orderId]/ detail (cancel/return/exchange)
      my/                #   account/profile
      wallet/            #   balance + transactions
      order-complete/    #   post-purchase confirmation
    api/                 # REST routes mirroring features
      auth/login/
      cart/  (+ [cartItemId]/)
      checkout/
      orders/  (+ [orderId]/ and cancel/ return/ exchange/)
      products/  (+ [productId]/ and reviews/)
      wallet/
      upload/            #   review photo upload
    login/               # login page (outside the commerce group)
    layout.tsx           # root layout: 430px mobile container, Toast provider, Material Icons
    page.tsx             # dev landing page (links to prototype + docs)
  components/
    layout/              # TitleBar, BottomTabBar, BackHeader, HomeCartIcon
    commerce/            # BannerCarousel, CategoryGrid, ProductCard, OptionSelector
    ui/                  # Button, Badge, Modal, BottomSheet, PriceDisplay,
                         #   QuantitySelector, LoadingSpinner, EmptyState, Toast
  hooks/
    useCart.tsx          # CartContext: cart item count + refresh
  lib/
    db.ts                # better-sqlite3 init (WAL mode), runs schema + seed
    schema.ts            # SQLite schema (~13 tables)
    seed.ts              # seed data loader
    session.ts           # getSessionId() — dodl_session cookie
    utils.ts             # formatPrice, generateOrderNumber, shipping/cancellable/returnable helpers
    constants.ts         # business-rule constants (see below)
    queries/             # products, cart, checkout, orders, wallet
  types/                 # product.ts, cart.ts, order.ts, wallet.ts
  middleware.ts          # auth guard
```

**Data-access pattern:** API routes do **not** write raw SQL. They call helper functions
in `src/lib/queries/*`, which own the SQL. Add new DB logic as a query function and call
it from the route.

## Business Rules & Conventions

From `src/lib/constants.ts`:

- **Shipping** — `SHIPPING_FEE = 3000` KRW; free when subtotal ≥ `FREE_SHIPPING_THRESHOLD = 30000`.
- **Wallet** — `INITIAL_WALLET_BALANCE = 100000` KRW per session. Transaction types:
  적립 (grant) / 사용 (payment) / 환불 (refund).
- **Order statuses** (`ORDER_STATUS`) — 결제완료, 배송준비, 배송중, 배송완료, 취소완료,
  반품요청, 반품완료, 교환요청, 교환완료.
- **Allowed actions** — cancel only when 결제완료/배송준비; return/exchange only when 배송완료.
- **Transactions** — checkout is atomic (deduct wallet → create order → clear cart).
  Cancel/return restore SKU stock and refund the wallet.
- **Pricing/options** — products are **SKU-based**: an option-value combination maps to a SKU
  with its own price and stock.

When editing:

- UI strings are **Korean** — match the existing tone and wording.
- **Reuse `src/lib/utils.ts` helpers** (`formatPrice`, `generateOrderNumber`, shipping and
  cancellable/returnable checks) instead of re-implementing them.
- Keep the **mobile-first 430px** layout defined in `src/app/layout.tsx`.

## Verifying Locally

1. Ensure `.env.local` has `AUTH_USERS` and `AUTH_SECRET`.
2. `npm run dev` → open http://localhost:3000.
3. You'll be redirected to `/login`. Sign in with a configured `AUTH_USERS` pair
   (e.g. `aubrey` / `aubrey111!`) to reach the commerce home.
