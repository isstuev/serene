"use client"

import { EntryCard } from "@/components/journal/EntryCard"
import type { Entry } from "@/lib/types"

function groupEntriesByDate(entries: Entry[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const weekAgo = new Date(today.getTime() - 7 * 86_400_000)

  const buckets: Record<string, Entry[]> = {
    Today: [],
    Yesterday: [],
    "Last week": [],
    Older: [],
  }

  for (const entry of entries) {
    const d = new Date(entry.createdAt)
    const entryDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (entryDay >= today) buckets.Today.push(entry)
    else if (entryDay >= yesterday) buckets.Yesterday.push(entry)
    else if (entryDay >= weekAgo) buckets["Last week"].push(entry)
    else buckets.Older.push(entry)
  }

  return Object.entries(buckets).filter(([, group]) => group.length > 0)
}

interface EntryTimelineProps {
  entries: Entry[]
  onEdit: (entry: Entry) => void
  onDelete: (id: string) => void
}

export function EntryTimeline({ entries, onEdit, onDelete }: EntryTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">
        No entries yet. Write your first one above!
      </div>
    )
  }

  const groups = groupEntriesByDate(entries)

  return (
    <div className="space-y-8">
      {groups.map(([label, group]) => (
        <section key={label}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </h3>
          <div className="space-y-3">
            {group.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
