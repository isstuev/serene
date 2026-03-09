import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { getEntryById, updateEntry, deleteEntry } from "@/lib/entries"
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

const updateEntrySchema = z.object({
  mood: z.enum(MOODS).optional(),
  tags: z.array(z.enum(TAGS)).optional(),
  note: z.string().min(1).optional(),
  vibeCheck: z.string().optional(),
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const entry = await getEntryById(id, session.user.id)
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(entry)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const entry = await updateEntry(id, session.user.id, parsed.data)
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(entry)
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const deleted = await deleteEntry(id, session.user.id)
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
