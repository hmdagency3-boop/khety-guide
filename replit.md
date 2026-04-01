# Workspace – Khety Guide

## Overview

A full-stack PWA (Progressive Web App) tourist guide for Egypt's historical and archaeological landmarks. The app is bilingual (Arabic / English) with RTL support.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4
- **API framework**: Express 5 (tsx in dev, esbuild ESM bundle in prod)
- **Auth & DB (app data)**: Supabase (client-side auth, RLS, realtime)
- **Payments**: Stripe (via Replit Stripe integration) — subscriptions, checkout, billing portal
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **i18n**: i18next + react-i18next (ar / en)
- **Push notifications**: Web Push + VAPID (via `web-push`)
- **Maps**: Leaflet + React-Leaflet
- **Routing (frontend)**: Wouter

## Structure

```text
├── artifacts/
│   ├── api-server/          # Express 5 API server
│   └── khety/               # React + Vite PWA frontend
├── lib/
│   ├── api-spec/            # OpenAPI 3.1 spec + Orval codegen config
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas from OpenAPI
│   └── db/                  # Drizzle ORM schema + DB connection
├── supabase/                # Supabase SQL migration scripts
├── scripts/                 # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Running the Project

Two workflows run in parallel:

| Workflow | Command | Port |
|---|---|---|
| `artifacts/khety: web` | `PORT=25246 BASE_PATH=/ pnpm --filter @workspace/khety run dev` | 25246 |
| `artifacts/api-server: API Server` | `PORT=8080 pnpm --filter @workspace/api-server run dev` | 8080 |

The frontend proxies `/api/*` requests to the API server (port 8080).

## Key Environment Variables

| Variable | Used by | Notes |
|---|---|---|
| `PORT` | Both services | Required — set per workflow |
| `BASE_PATH` | khety frontend | Defaults to `/` |
| `SUPABASE_URL` | api-server | Falls back to hardcoded dev URL |
| `SUPABASE_ANON_KEY` | api-server | Falls back to hardcoded dev key |
| `SUPABASE_SERVICE_ROLE_KEY` | api-server | Optional — needed for scheduled notifications under RLS |
| `VAPID_PUBLIC_KEY` | api-server | Required for push notifications |
| `VAPID_PRIVATE_KEY` | api-server | Required for push notifications |
| `VAPID_SUBJECT` | api-server | Defaults to `mailto:admin@example.com` |
| `DATABASE_URL` | lib/db | PostgreSQL — set by Replit if database is provisioned |
| `EXPLORER_MONTHLY_PRICE_ID` | api-server | Stripe price ID for Explorer monthly ($3.99) |
| `EXPLORER_YEARLY_PRICE_ID` | api-server | Stripe price ID for Explorer yearly ($35.99) |
| `PHARAOH_MONTHLY_PRICE_ID` | api-server | Stripe price ID for Pharaoh monthly ($9.99) |
| `PHARAOH_YEARLY_PRICE_ID` | api-server | Stripe price ID for Pharaoh yearly ($89.99) |
| `STRIPE_WEBHOOK_SECRET` | api-server | Optional — for webhook signature verification |

## Supabase

The app uses Supabase for:
- Authentication (email/password)
- User profiles & travel profiles
- Landmarks data
- Push subscriptions
- Notifications
- Visitor fingerprinting
- App settings / visibility toggles
- VIP invite codes
- Banners
- Support chat

SQL schemas are in `supabase/`. Run them in order in the Supabase SQL Editor.

## API Routes (Express)

All routes are mounted under `/api`:

| Method | Path | Description |
|---|---|---|
| GET | `/api/healthz` | Health check |
| GET | `/api/landmarks` | List landmarks (search, category filters) |
| GET | `/api/landmarks/:id` | Get single landmark |
| GET | `/api/tourist-rights` | Tourist rights info |
| GET | `/api/emergency-contacts` | Emergency contacts |
| GET | `/api/common-scams` | Common tourist scams |
| GET | `/api/push/vapid-public` | VAPID public key |
| POST | `/api/push/send` | Send push notification |
| POST | `/api/push/subscribe` | Save push subscription |
| GET/POST | `/api/scheduled/*` | Scheduled notifications |
| GET | `/api/stripe/publishable-key` | Get Stripe publishable key |
| GET | `/api/stripe/prices` | List active Stripe prices |
| GET | `/api/stripe/subscription` | Get user subscription status (auth required) |
| POST | `/api/stripe/create-checkout` | Create Stripe checkout session (auth required) |
| POST | `/api/stripe/create-portal` | Create Stripe billing portal session (auth required) |
| POST | `/api/stripe/sync-subscription` | Sync subscription from Stripe (auth required) |
| POST | `/api/stripe/webhook` | Stripe webhook receiver (raw body, pre-JSON middleware) |

## Frontend Pages

| Route | Page |
|---|---|
| `/` | Home – featured marvels carousel + highlights |
| `/explore` | Explore – searchable landmark grid |
| `/landmarks/:id` | Landmark detail with map |
| `/map` | Interactive Leaflet map |
| `/chat` | AI chat (Supabase powered) |
| `/safety` | Safety tips, emergency contacts, common scams |
| `/transit` | Transport info |
| `/guides` | Find a tour guide |
| `/support` | Support chat |
| `/profile` | User profile |
| `/invite` | Invite friends |
| `/pricing` | Subscription pricing — Traveler (Free) / Explorer ($3.99/mo) / Pharaoh ($9.99/mo) |
| `/admin` | Admin dashboard |
| `/login` | Login |
| `/register` | Register |
| `/onboarding` | Onboarding for new users |

## Stripe Subscriptions

The app uses Stripe (via Replit's Stripe integration) for subscription billing.

**Architecture:**
- `artifacts/api-server/src/stripeClient.ts` — fetches Stripe credentials dynamically from Replit connectors
- `artifacts/api-server/src/storage.ts` — PostgreSQL CRUD for the `app_users` table
- `artifacts/api-server/src/webhookHandlers.ts` — handles `customer.subscription.*` webhook events
- `artifacts/api-server/src/middlewares/auth.ts` — validates Supabase JWT tokens on protected routes
- `artifacts/api-server/src/routes/stripe.ts` — REST endpoints for prices, checkout, portal, sync
- `artifacts/khety/src/hooks/useSubscription.ts` — React hook: tier/status/checkout/portal actions
- `artifacts/khety/src/pages/Pricing.tsx` — full pricing page with monthly/yearly toggle
- `scripts/src/seed-products.ts` — run once to create Stripe products/prices in sandbox

**Supabase table (run `supabase/stripe_subscriptions.sql` in Supabase SQL Editor):**
- `app_users` — maps Supabase user IDs → Stripe customer/subscription IDs + tier/status
- Columns: `id, email, stripe_customer_id, stripe_subscription_id, stripe_price_id, subscription_status, subscription_tier, current_period_end`
- RLS enabled: authenticated users can read their own row; server uses service role key to bypass RLS

**Subscription tiers:**
| Tier | Monthly | Yearly |
|---|---|---|
| Free (Traveler) | Free | Free |
| Explorer / مستكشف | $3.99/mo | $35.99/yr |
| Pharaoh / فرعون | $9.99/mo | $89.99/yr |

**Webhook:** `POST /api/stripe/webhook` (raw body, registered before `express.json()`)

To re-seed products: `pnpm --filter @workspace/scripts run seed-products`

## i18n Languages

All 7 locale files (`ar/en/es/fr/it/ru/zh`) in `artifacts/khety/src/i18n/locales/`.
Namespaces: `common, nav, home, explore, landmark, chat, support, safety, guides, profile, auth, map, transit, lang, invite, pricing`

## TypeScript

- `lib/*` packages are composite — built with `tsc --build`
- `artifacts/*` are leaf packages — type-checked with `tsc --noEmit`
- Run `pnpm run typecheck` from the root for a full check

## Code Generation

Run `pnpm --filter @workspace/api-spec run codegen` to regenerate React Query hooks and Zod schemas from the OpenAPI spec.

Generated outputs:
- `lib/api-client-react/src/generated/api.ts` — React Query hooks
- `lib/api-client-react/src/generated/api.schemas.ts` — TypeScript types
- `lib/api-zod/src/generated/api.ts` — Zod validation schemas

## Build Scripts

| Script | Description |
|---|---|
| `pnpm run build:frontend` | Build Khety PWA → `artifacts/khety/dist/public/` |
| `pnpm run build:api` | Build API server → `artifacts/api-server/dist/` |
| `pnpm run build:libs` | Build all shared `lib/*` packages |
| `pnpm run build:all` | Build libs → frontend → api in order |
| `pnpm run build` | Full typecheck + recursive build |

**Note:** `build:frontend` works without `PORT` (it only checks PORT during `dev`/`preview`). PWA file size cache limit raised to 6 MiB to accommodate `khety-avatar.png`.

## Deployment

### Frontend → Netlify (موصى به)

`netlify.toml` مُعدّ بالكامل في جذر المشروع.

**من Netlify Dashboard:**
1. اضغط **Add new site → Import an existing project**
2. اختر GitHub repo (khety-guide)
3. Netlify يقرأ `netlify.toml` تلقائياً — لا تغيير مطلوب في الإعدادات
4. أضف متغيرات البيئة:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (URL الـ API server)
   - `BASE_PATH` = `/`
5. اضغط **Deploy**

ملاحظات تلقائية في `netlify.toml`:
- Build command: `pnpm install --frozen-lockfile && pnpm run build:frontend`
- Publish dir: `artifacts/khety/dist/public`
- Node version: 20 (LTS)
- SPA routing: كل الطلبات تتوجه لـ `index.html`
- Security headers: X-Frame-Options, X-Content-Type-Options, etc.
- Cache headers: assets تُكاش لـ سنة كاملة، sw.js و manifest بدون cache

### Frontend → Cloudflare Pages

`wrangler.toml` is configured at the repo root.

**Cloudflare Dashboard settings:**
- Build command: `pnpm run build:frontend`
- Output directory: `artifacts/khety/dist/public`
- Root directory: `/` (repo root)

**Required env vars in CF Dashboard:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL` (URL of deployed API server)
- `BASE_PATH` (set to `/` for root deployment)

**Or deploy via CLI:**
```sh
pnpm run build:frontend
pnpm dlx wrangler pages deploy artifacts/khety/dist/public --project-name khety-guide
```

### Backend → Render / Railway

Deploy `artifacts/api-server` as a Node.js web service.

- Build command: `pnpm install && pnpm run build:api`
- Start command: `node artifacts/api-server/dist/index.js`
- Required env vars: all vars in the Key Environment Variables table above

## TypeScript Config

- Root `tsconfig.json` references: `lib/api-zod` and `lib/api-client-react` (the two composite libs)
- **`lib/db` was removed** — it never existed and was a stale reference causing `tsc --build` to fail silently
- `lib/api-spec` and `lib/integrations` have no `tsconfig.json` and are not part of the TS build graph
