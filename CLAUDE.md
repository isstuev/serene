# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## MCP Servers

- **playwright** — browser automation for E2E testing (`.mcp.json` at repo root, `npx @playwright/mcp@latest`)

## Commands

All commands run from the repo root unless noted.

```bash
# Dev
npm run dev                  # Start Next.js dev server (http://localhost:3000)
npm run build                # Production build
npm run lint                 # ESLint (must run from apps/web/ or via workspace)

# Database (run from repo root or apps/web/)
npm run db:generate          # Generate Drizzle migrations after schema changes
npm run db:migrate           # Apply pending migrations
npm run db:studio            # Open Drizzle Studio (DB browser)

# Docker
docker-compose up db -d      # Start Postgres only
docker-compose up --build    # Full stack (db + migrate + web)
```

> `db:generate` and `db:migrate` must have `DATABASE_URL` set (from `.env.local`).

## Architecture

### Monorepo
npm workspaces. Single app at `apps/web/` (Next.js 15, App Router, TypeScript strict).

### Route Groups
- `/(app)/` — authenticated shell; `layout.tsx` calls `await auth()` and redirects to `/auth/signin` if no session
- `/auth/` — signin/signup pages (public)
- `/api/auth/[...nextauth]/` — NextAuth v5 handler (exports `{ GET, POST }` from `lib/auth.ts`)
- `/api/auth/register` — custom email/password registration endpoint
- `/api/entries/` — CRUD for journal entries (Stage 2+)
- `/api/vibe` — AI streaming endpoint using Vercel AI SDK `streamText` (Stage 4+)

Middleware (`apps/web/middleware.ts`) re-exports NextAuth's `auth` to protect all `/(app)/*` routes.

### Auth
NextAuth v5 beta (`next-auth@^5.0.0-beta.25`) with `@auth/drizzle-adapter`. Config lives in `lib/auth.ts` which exports `{ handlers, auth, signIn, signOut }`. Two providers: Credentials (bcryptjs, salt 12) + Google OAuth. **JWT session strategy** (`strategy: "jwt"`) — sessions are stateless JWTs; the DrizzleAdapter is used for user/account/verificationToken persistence only (the `sessions` table is not written to).

### Database
Drizzle ORM + postgres.js + PostgreSQL 16. Schema at `apps/web/drizzle/schema.ts`. All entry queries must scope by `user_id` (ownership enforcement). NextAuth adapter manages `users`, `accounts`, `sessions`, `verificationTokens` tables. App table: `entries` (mood, tags text[], note, vibe_check, timestamps).

### AI (Stage 4+)
Model: `claude-haiku-4-5-20251001`. Wrapper in `lib/ai.ts`. System prompt defines Serene as a wellness companion — see `SPEC.md` for exact prompt and required safety checks (length, crisis keywords, gibberish detection) that must run **before** calling the AI.

### UI
Tailwind CSS v4 + shadcn/ui (slate base, CSS vars). Custom calm palette: indigo, sage, warm. Components in `components/ui/` (shadcn primitives), `components/mood/`, `components/journal/`, `components/insights/`, `components/vibe/`. Use `cn()` from `lib/utils.ts` for conditional classes.

### Mood Values
Valid moods: `happy | calm | anxious | sad | overwhelmed | grateful | neutral`
Color map in SPEC.md (amber/teal/orange/blue/rose/emerald/slate).

## Key Decisions
- No separate backend — Next.js API routes only
- Drizzle over Prisma: explicit SQL-scoped queries
- Vercel AI SDK for streaming utilities only (not locked to Vercel hosting)
- No Redis/queue: vibe check streams synchronously in the save flow
