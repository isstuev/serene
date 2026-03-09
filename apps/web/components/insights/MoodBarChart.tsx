"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { Mood } from "@/lib/types"

const MOOD_COLORS: Record<Mood, string> = {
  happy: "#fbbf24",
  calm: "#2dd4bf",
  grateful: "#34d399",
  neutral: "#94a3b8",
  anxious: "#fb923c",
  sad: "#60a5fa",
  overwhelmed: "#fb7185",
}

const MOOD_LABELS: Record<Mood, string> = {
  happy: "Happy",
  calm: "Calm",
  grateful: "Grateful",
  neutral: "Neutral",
  anxious: "Anxious",
  sad: "Sad",
  overwhelmed: "Overwhelmed",
}

interface Props {
  data: { mood: Mood; count: number }[]
}

export function MoodBarChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-8">
        No mood data for this period.
      </p>
    )
  }

  const chartData = data.map((d) => ({
    mood: MOOD_LABELS[d.mood] ?? d.mood,
    count: d.count,
    color: MOOD_COLORS[d.mood] ?? "#94a3b8",
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <XAxis
          dataKey="mood"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          contentStyle={{ border: "none", borderRadius: 8, fontSize: 13 }}
        />
        <Bar dataKey="count" name="Entries" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
