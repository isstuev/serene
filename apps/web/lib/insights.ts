import { db } from "@/lib/db"
import { entries } from "@/drizzle/schema"
import { eq, and, gte, lte, isNotNull, sql } from "drizzle-orm"
import type { Mood } from "@/lib/types"

export async function getMoodCounts(
  userId: string,
  from: Date,
  to: Date
): Promise<{ mood: Mood; count: number }[]> {
  const rows = await db
    .select({
      mood: entries.mood,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(entries)
    .where(
      and(
        eq(entries.userId, userId),
        gte(entries.createdAt, from),
        lte(entries.createdAt, to)
      )
    )
    .groupBy(entries.mood)

  return rows
    .filter((r) => r.mood !== null)
    .map((r) => ({ mood: r.mood as Mood, count: r.count }))
}

export async function getTagFrequency(
  userId: string,
  from: Date,
  to: Date
): Promise<{ tag: string; count: number }[]> {
  const rows = await db
    .select({ tags: entries.tags })
    .from(entries)
    .where(
      and(
        eq(entries.userId, userId),
        gte(entries.createdAt, from),
        lte(entries.createdAt, to),
        isNotNull(entries.tags)
      )
    )

  const counts = new Map<string, number>()
  for (const row of rows) {
    for (const tag of row.tags ?? []) {
      const normalized = tag.trim()
      if (!normalized) continue
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getStreak(userId: string): Promise<number> {
  const rows = await db.execute(sql`
    SELECT DISTINCT date_trunc('day', "createdAt" AT TIME ZONE 'UTC') AS day
    FROM entries
    WHERE "userId" = ${userId}
    ORDER BY day DESC
  `)

  const dates = (rows as unknown as { day: Date }[]).map((r) => {
    const d = new Date(r.day)
    d.setUTCHours(0, 0, 0, 0)
    return d.getTime()
  })

  if (dates.length === 0) return 0

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const yesterday = today.getTime() - 86_400_000

  // Allow streak to start from today or yesterday (so a streak isn't broken
  // just because the user hasn't logged yet today)
  let streak = 0
  let expected = dates[0] === today.getTime() ? today.getTime() : yesterday

  for (const dayMs of dates) {
    if (dayMs === expected) {
      streak++
      expected -= 86_400_000
    } else if (dayMs < expected) {
      break
    }
  }

  return streak
}
