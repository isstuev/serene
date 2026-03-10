# Serene

A mood-tracking journaling app with AI-powered vibe checks. Write daily entries, track mood patterns over time, and get a compassionate AI reflection after each entry.

## Features

- **Journal** — create, edit, and delete entries with mood + activity tags
- **AI vibe check** — Claude Haiku streams a short wellness reflection after each save
- **Insights** — mood distribution and tag frequency charts (7 / 30 / 90-day range), streak counter
- **Auth** — email/password or Google OAuth; JWT sessions

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker (for Postgres) or an existing PostgreSQL 16 instance

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables (single source of truth)
cp .env.example .env
# Required: AUTH_SECRET, ANTHROPIC_API_KEY
# Optional: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# 3. Start Postgres
docker compose up db -d

# 4. Run migrations
npm run db:migrate

# 5. Start dev server
npm run dev
```

App runs at http://localhost:3000

`apps/web/.env` and `apps/web/.env.local` are auto-generated from root `.env` before app/database scripts run.

### Useful commands

```bash
npm run db:studio      # Drizzle Studio — browse the database
npm run db:generate    # Regenerate migrations after schema changes
npm run lint           # ESLint (run from apps/web/ or via workspace)
npm run build          # Production build
```

---

## Docker (Full Stack)

```bash
# Set required secrets in your environment or a .env file
export AUTH_SECRET="$(openssl rand -base64 32)"
export ANTHROPIC_API_KEY="sk-ant-..."

docker compose up --build
```

This starts Postgres, runs migrations automatically, then starts the web server. App runs at http://localhost:3000.

> Google OAuth (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) is optional — leave blank to disable that provider.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret for JWT signing (`openssl rand -base64 32`) |
| `AUTH_URL` | Yes | Base URL of the app (e.g. `http://localhost:3000`) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for AI vibe checks |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |

See `.env.example` for defaults.

---

## Architecture

### Monorepo

npm workspaces. Single app at `apps/web/` — Next.js 15 App Router, TypeScript strict mode.

### Route structure

```
/                        Landing page (public)
/auth/signin             Sign-in (public)
/auth/signup             Sign-up (public)
/(app)/home              Dashboard shell (auth-protected)
/(app)/journal           Journal CRUD (auth-protected)
/(app)/insights          Insights charts (auth-protected)
/api/auth/[...nextauth]  NextAuth v5 handler
/api/auth/register       Email/password registration
/api/entries             List + create entries
/api/entries/[id]        Get / update / delete entry
/api/insights            Aggregated mood + tag stats
/api/vibe                AI vibe check (streaming)
```

Middleware (`apps/web/middleware.ts`) protects all `/(app)/*` routes via NextAuth's `auth` export.

### Auth

NextAuth v5 beta with `@auth/drizzle-adapter`. Two providers: Credentials (bcryptjs, salt 12) and Google OAuth. Sessions use JWT strategy — stateless JWTs; the DrizzleAdapter persists users, accounts, and verification tokens only (the `sessions` table is not written to).

### Database

Drizzle ORM + postgres.js + PostgreSQL 16. Schema at `apps/web/drizzle/schema.ts`.

Tables:
- `users`, `accounts`, `sessions`, `verification_tokens` — managed by NextAuth adapter
- `entries` — `id`, `user_id`, `mood`, `tags` (text[]), `note`, `vibe_check`, `created_at`, `updated_at`

All entry queries scope by `user_id` (ownership enforcement).

### AI

Model: `claude-haiku-4-5-20251001` via the Anthropic SDK. Wrapper in `apps/web/lib/ai.ts`. The `/api/vibe` route streams tokens using Vercel AI SDK `streamText`. Safety checks (length, gibberish detection, crisis keywords) run before calling the model.

### UI

Tailwind CSS v4 + shadcn/ui (slate base, CSS variables). Custom calm palette: indigo, sage, warm. Charts use Recharts. Components live in `components/ui/` (shadcn primitives), `components/mood/`, `components/journal/`, `components/insights/`, `components/vibe/`, and `components/layout/`.
