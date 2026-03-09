import { db } from "@/lib/db"
import { entries } from "@/drizzle/schema"
import { eq, and, gte, lte, sql } from "drizzle-orm"
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
  const rows = await db.execute(sql`
    SELECT unnest(tags) AS tag, CAST(COUNT(*) AS int) AS count
    FROM entries
    WHERE "userId" = ${userId}
      AND "createdAt" >= ${from}
      AND "createdAt" <= ${to}
      AND tags IS NOT NULL
    GROUP BY tag
    ORDER BY count DESC
  `)
  return rows as unknown as { tag: string; count: number }[]
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

  let streak = 0
  let expected = today.getTime()

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
