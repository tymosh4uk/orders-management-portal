# Orders Management Portal

A Shopify embedded app for viewing orders, inspecting line items and variants, selecting orders, and exporting them to CSV. When a new order is created, the app saves a random Lorem Ipsum message to an order metafield via webhook.

Built with [React Router](https://reactrouter.com/), [Shopify App React Router](https://shopify.dev/docs/api/shopify-app-react-router), Polaris web components, and [Prisma](https://www.prisma.io/) (PostgreSQL for session storage).

## Features

- **Orders list** — paginated view of store orders with financial/fulfillment status and totals
- **Line items** — expand an order to see variants, SKUs, and options
- **Selection & export** — select orders and download a CSV of order + line-item data
- **Generated message** — `orders/create` webhook writes random text to the `generated_message` order metafield

## Requirements

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started)
- [Docker](https://www.docker.com/) (for local PostgreSQL)
- A Shopify Partner account and development store

## Project structure

```
app/
  orders/              # Orders UI, GraphQL queries, CSV export, webhook helpers
  routes/
    app._index.tsx     # Main orders page
    app.tsx            # Embedded app shell
    webhooks.*.tsx     # Shopify webhook handlers
    auth.login/        # Login page
prisma/                # Session storage schema & migrations
shopify.app.toml       # Production app config (Render URLs, webhooks, scopes)
shopify.app.local.toml # Localhost dev config (no webhook subscriptions)
render.yaml            # Render Blueprint (web service + PostgreSQL)
docker-compose.yml     # Local PostgreSQL
```

## Setup

```shell
npm install
cp .env.example .env
```

Start PostgreSQL locally:

```shell
docker compose up -d
```

Add to `.env`:

```shell
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/orders_management
```

Run database migrations:

```shell
npx prisma migrate deploy
```

Link the app to your Shopify Partner app (if not already linked):

```shell
shopify app config link
```

## Local development

### UI only (localhost, no webhooks)

```shell
npm run dev
```

Uses `shopify.app.local.toml`. Press **P** in the CLI to open the app preview and install on your dev store.

### UI + webhooks (ngrok tunnel)

Webhooks require a public HTTPS URL. Shopify cannot register `localhost` URLs.

**Terminal 1** — start ngrok:

```shell
ngrok http 3000
```

**Terminal 2** — copy the ngrok forwarding URL into `.env`, then start the app:

```shell
# .env — use the exact URL from the ngrok terminal (.dev or .app)
TUNNEL_URL=https://your-subdomain.ngrok-free.dev:3000

npm run dev:tunnel
```

Create a test order to verify the webhook — the CLI terminal should log `Saved generated message to #...`.

## Environment variables

| Variable | Local | Production (Render) |
|----------|-------|---------------------|
| `DATABASE_URL` | PostgreSQL connection string | Set automatically from Render Postgres |
| `SHOPIFY_API_KEY` | Provided by Shopify CLI | Set in Render dashboard |
| `SHOPIFY_API_SECRET` | Provided by Shopify CLI | Set in Render dashboard |
| `SCOPES` | `read_orders,read_products,write_orders` | Set in `render.yaml` |
| `SHOPIFY_APP_URL` | Set by CLI during dev | `https://orders-management-portal.onrender.com` |
| `NODE_ENV` | — | `production` |
| `TUNNEL_URL` | ngrok URL for `dev:tunnel` | Not needed |

View Shopify credentials locally:

```shell
shopify app env show
```

## Scopes & webhooks

**Scopes** (`shopify.app.toml`):

- `read_orders` — list orders in the UI
- `read_products` — variant details on line items
- `write_orders` — save the `generated_message` metafield

**Webhooks** (declared in `shopify.app.toml`, synced via `npm run deploy`):

| Topic | Handler | Purpose |
|-------|---------|---------|
| `orders/create` | `/webhooks/orders/create` | Save random Lorem Ipsum to order metafield |
| `app/uninstalled` | `/webhooks/app/uninstalled` | Clean up OAuth sessions |
| `app/scopes_update` | `/webhooks/app/scopes_update` | Update session scopes |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Localhost dev (UI only) |
| `npm run dev:tunnel` | Dev with ngrok for webhook testing |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run deploy` | Release app config to Shopify Partner Dashboard |
| `npm run setup` | `prisma generate` + `prisma migrate deploy` |
| `npm run typecheck` | TypeScript check |

## Deploy to Render

Production URL: `https://orders-management-portal.onrender.com`

### 1. Push to GitHub

```shell
git add .
git commit -m "Prepare Render deployment"
git push origin main
```

### 2. Create the Render stack

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. **New → Blueprint**
3. Connect this repository — Render reads `render.yaml` and creates a Docker web service and PostgreSQL database

### 3. Set Shopify secrets

In **Render → orders-management-portal → Environment**, add:

- `SHOPIFY_API_KEY` — from `shopify app env show`
- `SHOPIFY_API_SECRET` — from `shopify app env show`

Other variables are defined in `render.yaml`.

### 4. Release Shopify config

After the first deploy succeeds, confirm URLs in `shopify.app.toml` match your Render service URL, then:

```shell
npm run deploy
```

### 5. Install on your store

1. [Partner Dashboard](https://partners.shopify.com) → **orders management portal**
2. **Test your app** → select your dev store → Install

Uninstall and reinstall if the app was previously installed with localhost URLs.

### Changing the Render URL

If your Render service name differs from `orders-management-portal`:

1. Update `SHOPIFY_APP_URL` in Render
2. Update `application_url` and `redirect_urls` in `shopify.app.toml`
3. Run `npm run deploy`

## Protected customer data

The orders UI reads order and customer-related fields. Enable access in the Partner Dashboard:

**Apps → orders management portal → API access → Protected customer data**

Without this, the app shows a banner instead of order data.

## Troubleshooting

### `The table "Session" does not exist`

Run migrations:

```shell
npx prisma migrate deploy
```

### Webhooks not firing locally

Use `npm run dev:tunnel` with ngrok — `npm run dev` does not register webhook URLs. Confirm `TUNNEL_URL` in `.env` matches the ngrok forwarding URL exactly (including `.dev` vs `.app`).

### ngrok `ERR_NGROK_3200`

The tunnel is offline or `TUNNEL_URL` is wrong. Restart ngrok and update `.env`.

### App shows login/error after deploy

- Confirm `SHOPIFY_APP_URL` matches your Render URL
- Run `npm run deploy` to sync Shopify config
- Reinstall the app on your store

### Render free tier cold starts

The service sleeps after inactivity. The first request after sleep can take 30–60 seconds. Upgrade to a paid instance to avoid this.

### Orders page empty (no error)

Protected customer data access is likely not enabled — see above.

## Resources

- [Shopify App React Router](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Deploy a Shopify app on Render](https://render.com/docs/deploy-shopify-app)
- [App-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions)
