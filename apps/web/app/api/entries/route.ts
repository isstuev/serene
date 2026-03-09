import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { createEntry, getEntries } from "@/lib/entries"
import { z } from "zod"

const MOODS = [
  "happy",
  "calm",
  "anxious",
  "sad",
  "overwhelmed",
  "grateful",
  "neutral",
] as const

const TAGS = [
  "work",
  "sleep",
  "relationships",
  "fitness",
  "hobbies",
  "other",
] as const

const createEntrySchema = z.object({
  mood: z.enum(MOODS),
  tags: z.array(z.enum(TAGS)).default([]),
  note: z.string().min(1),
})

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")
  const from = fromParam ? new Date(fromParam) : undefined
  const to = toParam ? new Date(toParam) : undefined

  const entries = await getEntries(session.user.id, { from, to })
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    )
  }

  const entry = await createEntry({ userId: session.user.id, ...parsed.data })
  return NextResponse.json(entry, { status: 201 })
}
