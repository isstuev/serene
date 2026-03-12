# Scaling Plan for Serene (High-Traffic Growth)

This document identifies current bottlenecks in the Serene codebase and prescribes concrete changes needed to handle a large number of concurrent users. Each section links the diagnosis to an actionable fix.

---

## 1. Database

### 1.1 Missing Indexes

**Problem:** The `entries` table has no indexes beyond its primary key. Every query that filters by `userId` and `createdAt` performs a sequential scan. At scale this becomes the single largest performance bottleneck.

```
-- Affected queries: getEntries, getMoodCounts, getTagFrequency, getStreak
SELECT * FROM entries WHERE "userId" = $1 ORDER BY "createdAt" DESC;
```

**Fix:** Add composite indexes in the Drizzle schema:

```ts
// drizzle/schema.ts
export const entries = pgTable("entries", { ... }, (t) => [
  index("entries_user_created_idx").on(t.userId, t.createdAt.desc()),
]);
```

### 1.2 Tag Frequency Computed in Application Layer

**Problem:** `getTagFrequency` in `lib/insights.ts` fetches **all** matching rows from Postgres and does aggregation in JavaScript. At 1 M+ entries per user range this will OOM the Node process and take seconds.

```ts
// lib/insights.ts – current approach
const rows = await db.select({ tags: entries.tags }).from(entries)...
// then loops in JS to count tags
```

**Fix:** Move aggregation into Postgres using `unnest`:

```sql
SELECT tag, COUNT(*) AS count
FROM entries, unnest(tags) AS tag
WHERE "userId" = $1 AND "createdAt" BETWEEN $2 AND $3
GROUP BY tag
ORDER BY count DESC;
```

Expose this via a single Drizzle `sql` template so no data is shipped to the app layer.

### 1.3 Streak Query Fetches Unbounded History

**Problem:** `getStreak` fetches **every distinct day** a user ever logged an entry:

```ts
// lib/insights.ts
SELECT DISTINCT date_trunc('day', "createdAt" AT TIME ZONE 'UTC') AS day
FROM entries WHERE "userId" = $userId ORDER BY day DESC
```

For a user active for years, this is a large result set processed in JS.

**Fix:** Rewrite as a window-function query that only looks back as far as a gap exists — or store the `current_streak` as a denormalised integer on the `users` table, updated in a trigger or via the `createEntry` path.

### 1.4 No Connection Pooling

**Problem:** `lib/db.ts` sets `max: 1` per serverless instance. With hundreds of concurrent serverless invocations this creates hundreds of direct Postgres connections, exhausting `max_connections`.

```ts
// lib/db.ts
const client = postgres(connectionString, { max: 1 });
```

**Fix:** Add **PgBouncer** (transaction-mode pooler) in front of Postgres, or use **Supabase Pooler / Neon's pooling proxy**. The `prepare: false` flag is already set, which is required for pgbouncer compatibility.

### 1.5 Single Postgres Instance

**Problem:** One writer handles all reads and writes. Insights queries are read-heavy and long-running; they compete with writes.

**Fix:**
1. Add **read replicas** (managed via AWS RDS, Supabase, or Neon branching).
2. Route `SELECT`-only queries (insights, `getEntries` `GET`) to the replica connection string.
3. Keep all writes (`INSERT`, `UPDATE`, `DELETE`) on the primary.

### 1.6 No Pagination on `getEntries`

**Problem:** `GET /api/entries` and `getEntries()` return **all** entries for a user with no limit. A user with years of daily entries could receive thousands of rows in one response.

**Fix:** Add cursor-based or offset pagination:

```ts
// lib/entries.ts
export async function getEntries(
  userId: string,
  opts?: { from?: Date; to?: Date; limit?: number; cursor?: string }
)
```

Return a `nextCursor` in the API response and update the UI to paginate.

---

## 2. API Routes

### 2.1 No Rate Limiting

**Problem:** All API routes (`/api/entries`, `/api/vibe`, `/api/insights`) have no rate limiting. A single user (or bot) can flood the AI endpoint, exhausting the Anthropic API quota and driving up costs.

**Fix:** Add rate limiting middleware using a sliding-window counter in **Redis** (or Upstash for serverless):

```ts
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
// 10 vibe requests per user per minute
// 60 entry writes per user per minute
```

Apply stricter limits to `/api/vibe` than to `/api/entries`.

### 2.2 No Caching for Insights

**Problem:** Every `GET /api/insights` computes three expensive queries in parallel on each request. Popular time ranges (last 7 days) are recomputed identically for each page load.

**Fix:**
- Cache per-user insights with a **short TTL** (e.g. 60 s) using Redis (`cache.set(userId + range, result, 'EX', 60)`).
- Alternatively, set `Cache-Control: private, max-age=60` on the response and rely on the browser cache for single-user data.
- For server-side caching, Next.js `unstable_cache` or React cache API can wrap the insight fetchers.

### 2.3 No Retry / Fallback for Anthropic API

**Problem:** `POST /api/vibe` makes a synchronous call to Anthropic with no timeout, no retry, and no graceful degradation. A spike in users causes cascading timeouts.

**Fix:**
- Set an explicit timeout on the `streamText` call.
- Return a static fallback message (`NUDGE_RESPONSE` style) if the AI call fails or times out.
- Consider queuing vibe requests via a job queue (BullMQ + Redis) and delivering results via WebSocket / polling for very high traffic.

### 2.4 No Request Validation Middleware

**Problem:** Input validation is done ad-hoc per route (Zod in entries, manual checks in vibe). Malformed payloads reaching DB queries can cause unexpected errors.

**Fix:** Centralise validation with a shared Zod middleware or a helper `parseBody<T>(req, schema)` utility used across all routes.

---

## 3. Authentication & Security

### 3.1 bcrypt Cost Factor Under Signup Load

**Problem:** `bcrypt` at salt rounds 12 is intentionally slow (~ 300 ms per hash). Under signup spikes, this blocks the Node.js event loop on each `POST /api/auth/register`.

**Fix:**
- Move bcrypt hashing off the request thread by offloading to a worker thread (`worker_threads`) or a separate micro-service.
- Alternatively, reduce rounds to 10 in exchange for marginal security trade-off, or adopt **Argon2** which has better parallelism properties.

### 3.2 No Account Enumeration Protection

**Problem:** `POST /api/auth/register` returns different errors for "email exists" vs. "invalid input", enabling user enumeration.

**Fix:** Return a generic success response ("Check your email") regardless of whether the email was already registered, and send a notification email to existing users instead.

### 3.3 JWT Secret Rotation

**Problem:** `AUTH_SECRET` is a single static secret. Compromise requires invalidating all active sessions (no mechanism exists).

**Fix:** Support **key versioning** — maintain an ordered list of secrets; sign with the latest, accept any. Add a `kid` (key ID) claim to JWTs so old tokens can be migrated gracefully.

---

## 4. AI / LLM Cost Controls

### 4.1 No Per-User AI Budget

**Problem:** A single active user can trigger unlimited vibe checks per day, with no throttle or spend cap.

**Fix:**
- Add a `vibeCheckCount` column to `users` (reset daily via a cron job or lazy reset on request).
- Reject requests above a configurable daily limit (e.g. 10/day on free tier).

### 4.2 Prompt Tokens Not Bounded

**Problem:** The user's `note` field is passed verbatim to Claude with no token cap. A very long note drives up costs per request.

**Fix:** Truncate `note` to a maximum character count (e.g. 2 000 chars) before building the `userMessage` string in `/api/vibe/route.ts`.

### 4.3 No AI Response Caching

**Problem:** Two users entering identical moods and notes (unlikely but possible for common short phrases) generate two identical API calls.

**Fix:** Hash the input tuple `(mood, tags, note)` and check a short-lived cache (Redis, TTL 5 min) before calling Claude. Skip for crisis-keyword inputs.

---

## 5. Infrastructure & Deployment

### 5.1 Single Node.js Instance (No Horizontal Scaling)

**Problem:** The Docker Compose setup runs one `web` container. There is no load balancer, no orchestration, and no auto-scaling.

**Fix:**
- Migrate to a container orchestration platform (**Kubernetes** via EKS/GKE, or **Railway** / **Fly.io** with auto-scaling replicas).
- Alternatively, deploy the Next.js app to **Vercel** (serverless by default) and keep the DB on a managed provider (Neon, Supabase, RDS).
- Ensure the app is stateless (it already is — JWT auth, no in-memory state) so replicas are safe.

### 5.2 No CDN for Static Assets

**Problem:** Every user downloads JS bundles, fonts, and images directly from the app server.

**Fix:** Put a CDN (CloudFront, Cloudflare) in front of static assets. Next.js `assetPrefix` or Vercel's edge network handles this automatically if deployed there.

### 5.3 No Health Checks or Graceful Shutdown

**Problem:** The Dockerfile and docker-compose expose port 3000 but there is no `/api/health` endpoint. Load balancers cannot drain traffic before a pod restarts.

**Fix:**
- Add `GET /api/health` returning `{ status: "ok", db: "ok" }` (with a lightweight DB ping).
- Handle `SIGTERM` in the Next.js server to drain in-flight requests before exit.

### 5.4 Secrets in Environment Variables Only

**Problem:** All secrets (`AUTH_SECRET`, `ANTHROPIC_API_KEY`, DB URL) are plain environment variables with no rotation workflow.

**Fix:** Use a secrets manager (**AWS Secrets Manager**, **HashiCorp Vault**, or **Doppler**) with automatic rotation. Inject secrets at runtime, not build time.

---

## 6. Observability

### 6.1 No Structured Logging

**Problem:** Only one `console.error` exists in the codebase (in `/api/insights/route.ts`). There is no request-level logging, no trace IDs, and no log aggregation.

**Fix:**
- Adopt a structured logger (e.g. **Pino**) and emit JSON logs.
- Add a request middleware that attaches a `requestId` to every log line.
- Ship logs to a log aggregator (**Datadog**, **Axiom**, **Logtail**).

### 6.2 No Metrics or Alerting

**Problem:** There is no way to know if p99 latency is spiking, Anthropic calls are failing, or DB connections are saturating.

**Fix:**
- Instrument key paths with **OpenTelemetry** spans (DB queries, AI calls, auth).
- Export traces to **Jaeger** or **Honeycomb**.
- Set up alerts for: error rate > 1 %, p95 latency > 2 s, DB pool exhaustion.

### 6.3 No Error Monitoring

**Problem:** Unhandled exceptions in API routes are silently swallowed or produce generic 500 responses.

**Fix:** Integrate **Sentry** (or equivalent) with the Next.js SDK. Capture unhandled promise rejections and report them with user context (user ID, route).

---

## 7. Data Architecture

### 7.1 Tags Stored as `text[]`

**Problem:** Tags are a Postgres array column. Aggregation requires `unnest`, there is no cardinality constraint, and the column is not indexable with a standard B-tree.

**Fix for high scale:** Normalise tags into a separate `tags` table with a join table `entry_tags`. This enables efficient indexed lookups and prevents unbounded array growth. Alternatively, add a **GIN index** on the `tags` column for array containment queries:

```sql
CREATE INDEX entries_tags_gin_idx ON entries USING GIN (tags);
```

### 7.2 No Data Archival / Partitioning Strategy

**Problem:** The `entries` table will grow unboundedly. Old entries (> 1 year) are rarely accessed but inflate table size and slow down every query.

**Fix:**
- Implement **Postgres table partitioning** by `createdAt` (range partition per month/year).
- Archive entries older than 2 years to cold storage (S3 as Parquet, queryable via Athena) and soft-delete from the live table.

### 7.3 `vibeCheck` Stored as Unbounded `text`

**Problem:** The AI-generated `vibeCheck` is stored as plain text with no length cap. Adversarial prompts or API bugs could store very large strings.

**Fix:** Add a `varchar(1000)` constraint (or application-level truncation before `updateEntry`).

---

## Priority Matrix

| Area | Change | Impact | Effort |
|---|---|---|---|
| Database | Add `entries_user_created_idx` index | **Critical** | Low |
| Database | Pagination on `getEntries` | **Critical** | Low |
| Database | Move tag aggregation to SQL (`unnest`) | High | Low |
| Database | PgBouncer / connection pooler | High | Medium |
| API | Rate limiting on `/api/vibe` | High | Medium |
| API | Insights caching (Redis / `unstable_cache`) | High | Medium |
| AI | Per-user daily vibe check limit | High | Low |
| AI | Note truncation before AI call | Medium | Low |
| Infra | Health check endpoint | Medium | Low |
| Infra | Horizontal scaling / container orchestration | **Critical** | High |
| Observability | Structured logging (Pino) | High | Low |
| Observability | Sentry error monitoring | High | Low |
| Observability | OpenTelemetry tracing | Medium | Medium |
| Database | Read replicas for insights queries | Medium | High |
| Database | Table partitioning by `createdAt` | Low (long term) | High |
| Data | Normalise `tags` table | Low (long term) | High |
