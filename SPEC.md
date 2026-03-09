# Serene – Implementation Spec

## Overview

Monorepo with a Next.js frontend/API and a PostgreSQL database. The app ships as a Docker Compose stack: one service for the Next.js app, one for Postgres.

---

## Monorepo Structure

```
serene/
├── apps/
│   └── web/                  # Next.js 14 app (App Router)
│       ├── app/
│       │   ├── (marketing)/  # Landing page route group
│       │   ├── (app)/        # Authenticated app route group
│       │   │   ├── journal/
│       │   │   ├── insights/
│       │   │   └── layout.tsx
│       │   ├── api/
│       │   │   ├── auth/     # NextAuth route handler
│       │   │   ├── entries/  # CRUD endpoints
│       │   │   └── vibe/     # AI vibe-check streaming endpoint
│       │   ├── layout.tsx
│       │   └── page.tsx      # Landing page
│       ├── components/
│       │   ├── ui/           # shadcn/ui primitives
│       │   ├── mood/         # MoodSelector, MoodCard, MoodBadge
│       │   ├── journal/      # EntryEditor, EntryTimeline, EntryCard
│       │   ├── insights/     # WeeklyChart, MoodDistribution
│       │   └── vibe/         # VibeCheckPanel (streaming)
│       ├── lib/
│       │   ├── db.ts         # Drizzle ORM client
│       │   ├── auth.ts       # NextAuth config
│       │   ├── ai.ts         # Anthropic SDK wrapper
│       │   └── utils.ts
│       ├── drizzle/
│       │   ├── schema.ts
│       │   └── migrations/
│       ├── public/
│       ├── .env.local        # gitignored
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
├── Dockerfile
├── docker-compose.yaml
├── .env.example
└── README.md
```

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack in one process; streaming RSC + Server Actions |
| Language | TypeScript | Type safety across DB ↔ API ↔ UI |
| Styling | Tailwind CSS + shadcn/ui | Fast, calm design system |
| Auth | NextAuth v5 (Auth.js) | Email/password + Google OAuth; session stored in DB |
| Database | PostgreSQL 16 | Relational, reliable |
| ORM | Drizzle ORM | Lightweight, type-safe, migrations-first |
| AI | Anthropic Claude (claude-haiku-4-5) | Fast, cheap, empathetic; streaming via Vercel AI SDK |
| Charts | Recharts | Simple bar/radar charts |
| Containerization | Docker + Docker Compose | Single `docker-compose up` brings everything up |

---

## Database Schema

### `users`
Managed by NextAuth adapter — standard fields (id, email, name, image, emailVerified).

### `sessions`, `accounts`, `verification_tokens`
NextAuth adapter tables.

### `entries`
```
id           uuid        PK default gen_random_uuid()
user_id      uuid        FK → users.id ON DELETE CASCADE
mood         varchar(32) NOT NULL   -- enum: happy | calm | anxious | sad | overwhelmed | grateful | neutral
tags         text[]      NOT NULL DEFAULT '{}'  -- work | sleep | relationships | fitness | hobbies | other
note         text        NOT NULL
vibe_check   text                   -- AI response, nullable until generated
created_at   timestamptz NOT NULL DEFAULT now()
updated_at   timestamptz NOT NULL DEFAULT now()
```

Indexes: `(user_id, created_at DESC)` for timeline queries.

---

## API Routes

### Auth
- `GET/POST /api/auth/[...nextauth]` — NextAuth handler

### Entries
All routes require an authenticated session; user_id is pulled from session (never from the request body).

| Method | Path | Description |
|---|---|---|
| GET | `/api/entries` | List entries for the current user. Supports `?from=&to=` date filters. Returns entries grouped by date bucket (today / yesterday / last week / older). |
| POST | `/api/entries` | Create an entry. Body: `{ mood, tags, note }`. Triggers vibe-check asynchronously (or streams inline if called from the editor). |
| GET | `/api/entries/[id]` | Fetch a single entry (ownership enforced). |
| PATCH | `/api/entries/[id]` | Update mood, tags, note. Re-runs vibe-check if note changed. |
| DELETE | `/api/entries/[id]` | Delete entry. |

### Vibe Check
- `POST /api/vibe` — accepts `{ note, mood, tags }`, streams back an AI response using the Vercel AI SDK `streamText`. Returns `text/event-stream`.

---

## AI Vibe Check

**Model:** `claude-haiku-4-5-20251001` (fast + cheap for MVP).

**System prompt:**
```
You are Serene, a warm and empathetic mental wellness companion — not a therapist or clinician.
Your role is to offer a brief, supportive "vibe check" (1–2 sentences) that acknowledges the user's
feelings and gently encourages them. Be conversational, calm, and never prescriptive.
Do not diagnose, advise medication, or make clinical assessments.
If the user expresses thoughts of self-harm or crisis language, respond ONLY with the following
disclaimer and nothing else:
"It sounds like you might be going through a really tough time. Please reach out to a mental health
professional or contact a crisis line such as 988 (US) or Crisis Text Line (text HOME to 741741)."
```

**Input:**
```json
{
  "mood": "anxious",
  "tags": ["work", "sleep"],
  "note": "<user text>"
}
```

**Safety checks (server-side, before calling AI):**
1. Note length < 10 chars → return a static nudge ("Tell me a bit more so I can offer a better vibe check.").
2. Trigger word scan (self-harm keywords) → bypass AI, return crisis disclaimer directly.
3. Gibberish detection (no vowels or >80% non-alpha chars) → return static prompt to try again.

**Streaming:** The `/api/vibe` route uses `streamText` from `ai` (Vercel AI SDK) and pipes the `ReadableStream` directly to the response. The client uses the `useChat` / manual `ReadableStream` consumer to render tokens as they arrive.

---

## Pages & UI

### `/` — Landing Page
- Hero: headline, sub-headline, CTA ("Start journaling — it's free")
- Feature highlights (3 cards): Private & Secure, AI Vibe Check, Mood Insights
- Calm color palette: soft indigo, sage green, warm white
- No navbar clutter; single CTA drives to `/auth/signin`

### `/auth/signin` and `/auth/signup`
- Clean card layout, email/password + "Continue with Google"
- Minimal copy, calm illustration

### `/(app)/journal` — Main Journal View
- **Entry Editor** (top): MoodSelector → Tags → Note textarea → Save
  - Save button disabled until mood selected + note ≥ 50 chars
  - On save: optimistic UI, streams VibeCheck panel below the editor
- **Timeline** (below editor): entries grouped by date, newest first
  - Each card shows: mood badge (color-coded), tags, note excerpt, vibe check (collapsed), timestamp
  - Hover/tap to expand full note + vibe check
  - Edit (pencil icon) → opens entry back in editor inline
  - Delete (trash icon) → confirm modal → remove

### `/(app)/insights` — Weekly Insights
- Date range picker (defaults to current week)
- Bar chart: mood distribution (count per mood type)
- Radar/tag chart: most logged activity tags
- "Streak" counter: consecutive days with at least one entry

### Mood Color System
| Mood | Color |
|---|---|
| happy | amber-400 |
| calm | teal-400 |
| grateful | emerald-400 |
| neutral | slate-400 |
| anxious | orange-400 |
| sad | blue-400 |
| overwhelmed | rose-400 |

---

## Auth & Security

- All `/app/*` routes protected by a Next.js middleware that checks the NextAuth session cookie. Unauthenticated requests redirect to `/auth/signin`.
- All `/api/entries/*` routes call `getServerSession()` and 401 if no session.
- Ownership enforced on every DB query: `WHERE id = $1 AND user_id = $2`.
- Passwords hashed by NextAuth's Credentials provider using `bcryptjs`.
- CSRF protection: NextAuth handles this for its routes; API mutations require `Content-Type: application/json` (no CSRF token needed for same-origin fetch from Next.js).
- Environment secrets never exposed to the client bundle.

---

## Docker Setup

### `Dockerfile`
Multi-stage build:
1. **deps** — install production node_modules
2. **builder** — copy source, run `next build`
3. **runner** — minimal Node 20 alpine image, copies `.next/standalone` output

### `docker-compose.yaml`
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: serene
      POSTGRES_USER: serene
      POSTGRES_PASSWORD: serene
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U serene"]
      interval: 5s
      retries: 5

  web:
    build: .
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://serene:serene@db:5432/serene
      # remaining vars from .env or passed at runtime
    ports:
      - "3000:3000"

volumes:
  pgdata:
```

Migrations run automatically on container start via a `prestart` script: `drizzle-kit migrate`.

---

## Environment Variables (`.env.example`)

```env
# Database
DATABASE_URL=postgresql://serene:serene@localhost:5432/serene

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-32-char-string

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Key Decisions & Trade-offs

- **No separate backend service.** Next.js API routes are sufficient for MVP scale and keep the Docker footprint to two containers.
- **Drizzle over Prisma.** Drizzle's SQL-first approach makes ownership-scoped queries explicit and avoids magic.
- **Claude Haiku over GPT-4o-mini.** Haiku is faster and well-aligned for short empathetic responses; easy to swap models later.
- **Vercel AI SDK** used only for streaming utilities (`streamText`, `useCompletion`) — not locked into Vercel hosting.
- **No Redis/queue.** Vibe check streams synchronously in the save flow; acceptable latency for MVP.
- **shadcn/ui** gives accessible, unstyled-at-core components that are trivial to theme to a calm palette.
