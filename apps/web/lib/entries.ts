import { db } from "@/lib/db"
import { entries } from "@/drizzle/schema"
import { eq, and, desc, gte, lte } from "drizzle-orm"
import type { Mood, Tag } from "@/lib/types"

export async function createEntry(data: {
  userId: string
  mood: Mood
  tags: Tag[]
  note: string
}) {
  const [entry] = await db.insert(entries).values(data).returning()
  return entry
}

export async function getEntries(
  userId: string,
  opts?: { from?: Date; to?: Date }
) {
  const conditions = [eq(entries.userId, userId)]
  if (opts?.from) conditions.push(gte(entries.createdAt, opts.from))
  if (opts?.to) conditions.push(lte(entries.createdAt, opts.to))
  return db
    .select()
    .from(entries)
    .where(and(...conditions))
    .orderBy(desc(entries.createdAt))
}

export async function getEntryById(id: string, userId: string) {
  const [entry] = await db
    .select()
    .from(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)))
  return entry ?? null
}

export async function updateEntry(
  id: string,
  userId: string,
  data: { mood?: Mood; tags?: Tag[]; note?: string; vibeCheck?: string | null }
) {
  const [entry] = await db
    .update(entries)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(entries.id, id), eq(entries.userId, userId)))
    .returning()
  return entry ?? null
}

export async function deleteEntry(id: string, userId: string) {
  const result = await db
    .delete(entries)
    .where(and(eq(entries.id, id), eq(entries.userId, userId)))
    .returning()
  return result.length > 0
}
