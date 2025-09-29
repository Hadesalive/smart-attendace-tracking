### Environment Variables

This project uses Next.js (App Router) with Supabase. Below is a complete list of environment variables, a ready-to-copy `.env.example`, and guidance on how/where to load them for development, scripts, and production.

### .env.example

```bash
# ──────────────────────────────────────────────────────────────────────────────
# Supabase (Required)
# ──────────────────────────────────────────────────────────────────────────────
# Public URL of your Supabase project (Settings → API → Project URL)
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"

# Public anon key (Settings → API → anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_PUBLIC_KEY"

# Service role key (Settings → API → service_role)
# WARNING: Highly sensitive. Never expose in the browser or commit to Git.
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# Note: The seed script currently reads this key from NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY.
# To keep it working without code changes, set BOTH of the below to the same value:
# (Prefer long-term: update the script to use SUPABASE_SERVICE_ROLE_KEY only.)
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"


# ──────────────────────────────────────────────────────────────────────────────
# Node/Next.js runtime
# ──────────────────────────────────────────────────────────────────────────────
# Optional: Next.js uses this automatically; set if you need to override behavior.
# Acceptable values: development | production | test
NODE_ENV=development
```

### What each variable does

- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL. Exposed to the browser by design.
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Public anon key used by the client to connect to Supabase. Exposed to the browser.
- **SUPABASE_SERVICE_ROLE_KEY**: Server-only key with elevated privileges (bypasses RLS). Used only on the server (e.g., `lib/supabase/admin.ts`) or Node scripts. Never ship to the client.
- **NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY**: Temporary compatibility for `scripts/seed.ts`. Mirrors the service role key but should be removed once the script is fixed to read `SUPABASE_SERVICE_ROLE_KEY`.
- **NODE_ENV**: Standard Node/Next.js runtime mode.

### Where variables are used in this codebase

- `lib/supabase.ts`: uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` to create the client.
- `lib/supabase/admin.ts`: uses `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` for admin server-side operations.
- `lib/supabase/middleware.ts` and `middleware.ts`: SSR client reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `scripts/seed.ts`: reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` (see note above).
- `scripts/create-student-profiles.js`: reads `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `scripts/create-users-simple.js`: reads `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- `app/api/check-env/route.ts`: verifies `SUPABASE_SERVICE_ROLE_KEY` is present.

### How to set up locally

1) Create `.env.local` at the repo root for Next.js runtime:

```bash
cp .env.example .env.local
```

2) Create `.env` for Node scripts (seeding, utilities):

```bash
cp .env.example .env
```

3) Fill in values from Supabase Dashboard → Settings → API:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_ROLE_KEY` (and also set `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` until the script is updated)

4) Validate your setup in the browser API route:

- Visit `/api/check-env` to confirm `SUPABASE_SERVICE_ROLE_KEY` is detected by the server runtime.

### Using the variables

- **Next.js app runtime**: Next automatically loads `.env.local` in development.
- **Node scripts**: These scripts load from `.env` using `dotenv` (see `scripts/seed.ts` and `scripts/create-users-simple.js`).

### Production deployment notes

- Set the same variables in your hosting provider’s environment configuration (Vercel, Netlify, Render, etc.).
- Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Only configure it as a server-side secret.
- If using Vercel, do not prefix server-only secrets with `NEXT_PUBLIC_`.

### Security best practices

- Never commit `.env*` files. Keep them in local/devops secrets storage.
- Rotate `SUPABASE_SERVICE_ROLE_KEY` if you suspect exposure.
- Limit server actions and API routes to server-side execution when using the service role key.

### Troubleshooting

- Missing env error like "Missing env.NEXT_PUBLIC_SUPABASE_URL": ensure `.env.local` is present and values are set.
- `scripts/seed.ts` complains about missing service role: set both `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` in `.env` until the script is updated.
- 401/Forbidden from Supabase on client: verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` and RLS policies.
