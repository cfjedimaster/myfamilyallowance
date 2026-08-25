# My Family Allowance

Track kids’ weekly allowance with a parent Google login, a short family URL, and automatic Sunday credits.

## Features

- Marketing homepage
- Parent login with Google
- Admin: add / edit / delete kids, set weekly allowance, add or deduct money with a memo
- Unique family page at `/f/{5-char-slug}` protected by a shared password (7-day sliding cookie)
- Paginated transaction history per kid
- Netlify scheduled function every Sunday adds allowance (skips if already credited in the last 6 days)

## Stack

- Astro (SSR) + vanilla CSS / JS (no React)
- Netlify hosting + scheduled functions
- Netlify Database (Postgres) via `@netlify/database` + Drizzle

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:

| Variable | Purpose |
|----------|---------|
| `SITE_URL` | App origin, e.g. `http://localhost:8888` locally or `https://your-site.netlify.app` in production |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth web client |
| `GOOGLE_REDIRECT_URI` | Optional; defaults to `${SITE_URL}/auth/callback` |
| `SESSION_SECRET` | Random string, **at least 32 characters**, used to seal cookies |
| `CRON_SECRET` | Optional; Bearer token for manually invoking the weekly allowance function |

### 3. Google OAuth app setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Go to **APIs & Services → OAuth consent screen**. Choose **External** (or Internal for Workspace-only). Add your email as a test user while the app is in Testing.
3. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**.
4. Application type: **Web application**.
5. **Authorized JavaScript origins**
   - `http://localhost:8888`
   - `https://your-production-domain`
6. **Authorized redirect URIs**
   - `http://localhost:8888/auth/callback`
   - `https://your-production-domain/auth/callback`
7. Copy the Client ID and Client Secret into `.env` (local) and Netlify site env vars (production).
8. Set `SITE_URL` to match the environment you are running (local vs production). If you prefer an explicit redirect, set `GOOGLE_REDIRECT_URI` to the same callback URL registered above.

Scopes used: `openid email profile`.

### 4. Netlify Database

```bash
npx netlify database init --yes   # if not already initialized for this site
npx netlify database migrations apply
npx netlify dev
```

`netlify database init` installs/configures `@netlify/database`. Migrations live in `netlify/database/migrations/` and are applied automatically on deploy; locally you apply them with `migrations apply` while the local DB is running (`netlify dev`).

### 5. Run locally

```bash
npx netlify dev
```

Open `http://localhost:8888`.

## Deploy on Netlify

1. Create a Netlify site linked to this repo (or `npx netlify init`).
2. Set env vars in **Site configuration → Environment variables**:
   - `SITE_URL` = your production URL (no trailing slash)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `SESSION_SECRET` (32+ random chars)
   - Optional: `GOOGLE_REDIRECT_URI`, `CRON_SECRET`
3. Add the production origin and `/auth/callback` redirect URI in the Google OAuth client.
4. Deploy. Netlify provisions the database (with `@netlify/database` present) and applies migrations.
5. Confirm the scheduled function `weekly-allowance` is listed (cron `0 12 * * 0` ≈ Sunday 7am America/Chicago during CDT).

### Manual allowance run (optional)

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-site.netlify.app/.netlify/functions/weekly-allowance
```

## Security notes

- Parent admin mutations require a sealed parent session and verify kid ownership server-side.
- Family cookie is read-only, scoped to the family slug, lasts 7 days with sliding renewal, and is invalidated when the family password changes.
- The weekly function accepts Netlify schedule invocations or `Authorization: Bearer $CRON_SECRET`.

## Schema

- `users` — Google identity, family slug, password hash + version
- `kids` — name, weekly allowance (cents)
- `transactions` — amount (cents), memo, `from_allowance` flag
