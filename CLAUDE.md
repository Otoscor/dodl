# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project Overview

**dodl** is a Korean healthcare/supplement **mini e-commerce prototype**. It is a
mobile-first web app (fixed 430px-wide container) covering the full shopping flow:
product catalog → cart → checkout → orders (cancel/return/exchange) → virtual wallet
→ my page (profile, coupons, points, reviews, inquiries, settings).

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
- **framer-motion 12** — React spring/slide/fade animations (scanner interactions)
- **gsap 3 + @gsap/react 2** — timeline-based animation (installed, available)
- **lenis 1** — smooth scroll inertia (installed, available)
- Dev tooling: ESLint 9 (`eslint-config-next`)

Animation exports are centralised in `src/lib/animation.ts` — import from there, not directly.

`next.config.ts` also allows remote images from `images.unsplash.com`.

## Commands

```bash
npm run dev        # dev server → http://localhost:3000
npm run build      # production build
npm run start      # run production build
npm run lint       # ESLint
```

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

Cookie-based, no real account system.

- **`src/middleware.ts`** — guards all routes except `/login`, `/api/auth/*`,
  `_next/static`, `_next/image`, `favicon.ico`, and static image files. Compares the `dodl_auth`
  cookie against `AUTH_SECRET`; redirects to `/login` on mismatch.
- **`src/app/api/auth/login/route.ts`** (POST) — validates `{ id, password }` against
  `AUTH_USERS`. On success sets two httpOnly cookies: `dodl_auth` (7 days) and
  `dodl_session` (30 days).
- **`src/app/api/auth/logout/route.ts`** (POST) — expires both cookies (`Max-Age=0`).
  My page calls this, shows a confirm modal, then redirects to `/login`.
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
      my/                #   my page hub + all sub-pages (see My Page section)
      wallet/            #   balance + transactions
      order-complete/    #   post-purchase confirmation
      scanner/           #   단백질 스캐너 — 3-step quiz → Top 3 protein shake recommendation
    api/                 # REST routes mirroring features
      auth/login/        #   POST — set auth cookies
      auth/logout/       #   POST — expire auth cookies (로그아웃)
      cart/  (+ [cartItemId]/)
      checkout/
      orders/  (+ [orderId]/ and cancel/ return/ exchange/)
      products/  (+ [productId]/ and reviews/)
      wallet/
      upload/            #   review photo upload
    login/               # login page (outside the commerce group)
    layout.tsx           # root layout: 430px mobile container, Toast provider, Material Icons
    page.tsx             # dev landing page (link to prototype)
  components/
    layout/              # TitleBar, BottomTabBar, BackHeader, HomeCartIcon
    commerce/            # BannerCarousel, CategoryGrid, ProductCard, OptionSelector,
                         #   WriteReviewSheet (shared review form bottom sheet),
                         #   MyProductRow (horizontal list item for my page)
    ui/                  # Button, Badge, Modal, BottomSheet, PriceDisplay,
                         #   QuantitySelector, LoadingSpinner, EmptyState, Toast,
                         #   ToggleSwitch (notification settings)
  hooks/
    useCart.tsx          # CartContext: cart item count + refresh
  lib/
    db.ts                # better-sqlite3 init (WAL mode), runs schema + seed
    schema.ts            # SQLite schema (~13 tables)
    seed.ts              # seed data loader
    session.ts           # getSessionId() — dodl_session cookie
    utils.ts             # formatPrice, generateOrderNumber, originalPrice (정상가 역산),
                         #   shipping/cancellable/returnable helpers
    constants.ts         # business-rule constants (see below)
    animation.ts         # re-exports framer-motion, gsap, @gsap/react, lenis
    queries/             # products, cart, checkout, orders, wallet
  types/                 # product.ts, cart.ts, order.ts, wallet.ts
  middleware.ts          # auth guard
```

**Data-access pattern:** API routes do **not** write raw SQL. They call helper functions
in `src/lib/queries/*`, which own the SQL. Add new DB logic as a query function and call
it from the route.

## My Page (`/my`) — Sub-pages

All sub-pages live under `src/app/(commerce)/my/`. Mock data is centralised in
`src/app/(commerce)/my/mock.ts` — add new virtual datasets there.

| Route | Description |
|---|---|
| `/my` | Hub — profile (grade badge), 3-up assets (coupon·point·wallet), group menu |
| `/my/reviews` | 2-tab: **작성 가능한 리뷰** (writable, per-item form → `WriteReviewSheet`) / **내 리뷰** (written, with photo strip) |
| `/my/likes` | 찜한 상품 — real products via `/api/products`, `MyProductRow` horizontal list |
| `/my/recent` | 최근 본 상품 — same pattern as likes |
| `/my/following` | 팔로잉 브랜드 — follow/unfollow toggle (local state) |
| `/my/coupons` | 쿠폰함 — tag+big-discount card, filter tabs, **쿠폰 등록** modal, **편집** mode with fixed-bottom delete bar |
| `/my/points` | 포인트 내역 — balance card + pending/expiring/rate 3-up + expiry warning banner + filter tabs + balance-after per row |
| `/my/events` | 진행 중인 이벤트 — banner cards |
| `/my/notices` | 공지사항 — inline accordion |
| `/my/faq` | 자주 묻는 질문 — Q accordion |
| `/my/inquiry` | 1:1 문의 — list first, tap to expand Q→A thread, fixed-bottom **문의하기** → `BottomSheet` form |
| `/my/addresses` | 배송지 관리 — default badge, mock CRUD (toast) |
| `/my/payments` | 결제수단 관리 — card/account list, mock CRUD (toast) |
| `/my/notifications` | 알림 설정 — `ToggleSwitch` rows, persisted to `localStorage` |

## Scanner (`/scanner`) — 단백질 스캐너

Self-contained feature under `src/app/(commerce)/scanner/`. No DB dependency — all data
is static files in the same directory.

- **`data.ts`** — `QUESTIONS` (3 single-select steps: goal/reduce/texture), `PRODUCTS`
  (8 protein shakes with tags), `TAG_LABEL` map, `QUESTION_WEIGHT` (goal×3, reduce×2, texture×1).
- **`recommend.ts`** — pure `recommend(answers)` → Top 3 `{ product, reasons }[]`.
- **`interactions.ts`** — 4 animation presets: `Instant / Slide / Fade / Pop`.
  Each preset defines `stepVariants`, `stepTransition`, `optionWhileTap`, `resultStagger`,
  `resultCardVariants`. Stored in `localStorage` (`dodl_scanner_interaction`).
- **`InteractionSheet.tsx`** — bottom sheet UI to switch preset + toggle stagger mode
  (`dodl_scanner_stagger` in `localStorage`).
- **`page.tsx`** — quiz UI. Caption row and title are static; only the **options/result
  cards area** animates. `AnimatePresence mode="wait"` wraps the animated zone.
  Stagger mode: container uses `staggerChildren`, items use `resultCardVariants`.

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
- **Display discount** — `DISPLAY_DISCOUNT_RATE = 0.2` (20%). The product detail page
  shows 정상가 (crossed out) derived by `originalPrice(finalPrice)` in `utils.ts`
  (reverse-calculates from SKU price, rounds to nearest 100 KRW). Demo only — no real
  original price data in DB.

When editing:

- UI strings are **Korean** — match the existing tone and wording.
- **Reuse `src/lib/utils.ts` helpers** (`formatPrice`, `originalPrice`, `generateOrderNumber`,
  shipping and cancellable/returnable checks) instead of re-implementing them.
- Keep the **mobile-first 430px** layout defined in `src/app/layout.tsx`.
- Mock/virtual data belongs in `src/app/(commerce)/my/mock.ts` (my sub-pages) or
  co-located `data.ts` (scanner). Do not touch the SQLite seed for display-only data.
- Use `src/lib/animation.ts` for animation imports — do not import framer-motion/gsap/lenis directly.

## Verifying Locally

1. Ensure `.env.local` has `AUTH_USERS` and `AUTH_SECRET`.
2. `npm run dev` → open http://localhost:3000.
3. You'll be redirected to `/login`. Sign in with a configured `AUTH_USERS` pair
   (e.g. `aubrey` / `aubrey111!`) to reach the commerce home.
4. Logout: My page → 로그아웃 → confirm modal → redirects to `/login`.
