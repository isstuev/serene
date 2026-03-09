"use client"

import { useState } from "react"
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { MoodBadge } from "@/components/mood/MoodBadge"
import { cn } from "@/lib/utils"
import type { Entry, Mood, Tag } from "@/lib/types"

const EXCERPT_LENGTH = 150

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

interface EntryCardProps {
  entry: Entry
  onEdit: (entry: Entry) => void
  onDelete: (id: string) => void
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false)

  const note = entry.note ?? ""
  const tags = (entry.tags ?? []) as Tag[]
  const mood = entry.mood as Mood | null
  const needsExpand = note.length > EXCERPT_LENGTH || !!entry.vibeCheck
  const displayNote =
    expanded || !needsExpand ? note : note.slice(0, EXCERPT_LENGTH) + "…"

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {mood && <MoodBadge mood={mood} />}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-shrink-0 items-center gap-0.5">
          <span className="mr-1 text-xs text-slate-400">
            {formatDate(entry.createdAt)}
          </span>
          <button
            onClick={() => onEdit(entry)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Edit entry"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
            aria-label="Delete entry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Note */}
      <p
        className={cn(
          "mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap",
          !expanded && needsExpand && "line-clamp-4"
        )}
      >
        {displayNote}
      </p>

      {/* Vibe check (expanded only) */}
      {expanded && entry.vibeCheck && (
        <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2.5">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-indigo-400">
            Vibe check
          </p>
          <p className="text-sm leading-relaxed text-indigo-700">
            {entry.vibeCheck}
          </p>
        </div>
      )}

      {/* Expand / collapse */}
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-500 hover:text-indigo-700"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> Show more
            </>
          )}
        </button>
      )}
    </div>
  )
}
