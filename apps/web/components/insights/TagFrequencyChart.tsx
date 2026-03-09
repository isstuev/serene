"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface Props {
  data: { tag: string; count: number }[]
}

export function TagFrequencyChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-8">
        No tag data for this period.
      </p>
    )
  }

  const chartData = data.map((d) => ({
    tag: d.tag.charAt(0).toUpperCase() + d.tag.slice(1),
    count: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
      >
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="tag"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          cursor={{ fill: "#f1f5f9" }}
          contentStyle={{ border: "none", borderRadius: 8, fontSize: 13 }}
        />
        <Bar dataKey="count" name="Times logged" fill="#818cf8" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
