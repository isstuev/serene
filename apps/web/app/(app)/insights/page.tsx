"use client"

import { useEffect, useState, useCallback } from "react"
import { Flame, BarChart3, Tag } from "lucide-react"
import { MoodBarChart } from "@/components/insights/MoodBarChart"
import { TagFrequencyChart } from "@/components/insights/TagFrequencyChart"
import type { Mood } from "@/lib/types"

type Range = "7" | "30" | "90"

interface InsightsData {
  moodCounts: { mood: Mood; count: number }[]
  tagFrequency: { tag: string; count: number }[]
  streak: number
}

function getRangeLabel(days: Range) {
  return days === "7" ? "Last 7 days" : days === "30" ? "Last 30 days" : "Last 90 days"
}

function buildParams(days: Range) {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (Number(days) - 1))
  from.setUTCHours(0, 0, 0, 0)
  return `from=${from.toISOString()}&to=${to.toISOString()}`
}

export default function InsightsPage() {
  const [range, setRange] = useState<Range>("7")
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async (r: Range) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/insights?${buildParams(r)}`)
      if (!res.ok) throw new Error("Failed to load insights")
      setData(await res.json())
    } catch {
      setError("Could not load insights. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInsights(range)
  }, [range, fetchInsights])

  const totalEntries = data
    ? data.moodCounts.reduce((sum, m) => sum + m.count, 0)
    : 0

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Insights</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Your mood and activity patterns
          </p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as Range)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Streak + summary row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-white px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Streak</p>
            {loading ? (
              <div className="h-7 w-12 bg-slate-100 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-2xl font-bold text-slate-800">
                {data?.streak ?? 0}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  {data?.streak === 1 ? "day" : "days"}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white px-5 py-4 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">
              {getRangeLabel(range)}
            </p>
            {loading ? (
              <div className="h-7 w-12 bg-slate-100 rounded animate-pulse mt-0.5" />
            ) : (
              <p className="text-2xl font-bold text-slate-800">
                {totalEntries}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  {totalEntries === 1 ? "entry" : "entries"}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Mood bar chart */}
      <div className="rounded-2xl border border-border bg-white px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">Mood distribution</h2>
        </div>
        {loading ? (
          <div className="h-[220px] bg-slate-50 rounded-lg animate-pulse" />
        ) : (
          <MoodBarChart data={data?.moodCounts ?? []} />
        )}
      </div>

      {/* Tag frequency chart */}
      <div className="rounded-2xl border border-border bg-white px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-slate-700">Top activities</h2>
        </div>
        {loading ? (
          <div className="h-[220px] bg-slate-50 rounded-lg animate-pulse" />
        ) : (
          <TagFrequencyChart data={data?.tagFrequency ?? []} />
        )}
      </div>
    </div>
  )
}
