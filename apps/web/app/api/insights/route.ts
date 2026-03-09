import { auth } from "@/lib/auth"
import { getMoodCounts, getTagFrequency, getStreak } from "@/lib/insights"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const toDate = searchParams.get("to")
    ? new Date(searchParams.get("to")!)
    : new Date()
  const fromDate = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : (() => {
        const d = new Date(toDate)
        d.setDate(d.getDate() - 6)
        d.setUTCHours(0, 0, 0, 0)
        return d
      })()

  toDate.setUTCHours(23, 59, 59, 999)

  const userId = session.user.id

  const [moodCounts, tagFrequency, streak] = await Promise.all([
    getMoodCounts(userId, fromDate, toDate),
    getTagFrequency(userId, fromDate, toDate),
    getStreak(userId),
  ])

  return NextResponse.json({ moodCounts, tagFrequency, streak })
}
