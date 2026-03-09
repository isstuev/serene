# Serene – Implementation Plan

## Phase 1 — Scaffold & Auth
- [ ] Init npm workspaces monorepo
- [ ] Create `apps/web` with Next.js 15 + TypeScript
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Drizzle schema (`users`, `accounts`, `sessions`, `verification_tokens`, `entries`)
- [ ] Initial Drizzle migration
- [ ] NextAuth v5 — Credentials provider (email/password with bcryptjs)
- [ ] NextAuth v5 — Google OAuth provider
- [ ] Middleware to protect `/(app)/*` routes
- [ ] `Dockerfile` (multi-stage, standalone output)
- [ ] `docker-compose.yaml` (web + postgres, healthcheck, auto-migrate on start)
- [ ] `.env.example`
- [ ] `README.md` skeleton

## Phase 2 — Landing Page & Shell
- [ ] Landing page (`/`) — hero, feature highlights, CTA
- [ ] Sign-in page (`/auth/signin`)
- [ ] Sign-up page (`/auth/signup`)
- [ ] Authenticated shell layout — nav/sidebar, user avatar, sign-out

## Phase 3 — Journal CRUD
- [ ] `GET /api/entries` — list with date grouping (today / yesterday / last week / older)
- [ ] `POST /api/entries` — create entry
- [ ] `GET /api/entries/[id]` — fetch single (ownership enforced)
- [ ] `PATCH /api/entries/[id]` — update
- [ ] `DELETE /api/entries/[id]` — delete
- [ ] `MoodSelector` component (icons/cards, 7 moods, color-coded)
- [ ] `TagsSelector` component (multi-select chips)
- [ ] Note textarea with 50-char minimum counter
- [ ] Entry editor — save flow with validation
- [ ] `EntryTimeline` — grouped feed, newest first
- [ ] `EntryCard` — mood badge, tags, excerpt, expand/collapse
- [ ] Inline edit flow (editor pre-filled from card)
- [ ] Delete confirmation modal

## Phase 4 — AI Vibe Check
- [ ] `POST /api/vibe` — streaming endpoint (Vercel AI SDK `streamText` + Claude Haiku)
- [ ] System prompt configured as non-clinical companion
- [ ] Safety guardrails: short input, gibberish detection, trigger-word crisis disclaimer
- [ ] `VibeCheckPanel` component — streams tokens in real-time
- [ ] Vibe check triggered on entry save; result persisted to `entries.vibe_check`

## Phase 5 — Insights
- [ ] Aggregation query — mood counts per day for date range
- [ ] Aggregation query — tag frequency for date range
- [ ] Streak counter — consecutive days with ≥1 entry
- [ ] `/insights` page with date range picker
- [ ] Weekly mood bar chart (Recharts)
- [ ] Tag frequency chart (Recharts)
- [ ] Streak display

## Phase 6 — Polish & Ship
- [ ] Mobile-first responsive audit
- [ ] Loading skeletons for timeline and vibe check
- [ ] Error boundaries and user-facing error states
- [ ] Empty states (no entries yet, no insights data)
- [ ] `README.md` — local setup, Docker setup, architecture overview
- [ ] Docker smoke test (`docker-compose up` end-to-end)
