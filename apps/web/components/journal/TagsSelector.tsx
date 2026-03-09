"use client"

import { cn } from "@/lib/utils"
import type { Tag } from "@/lib/types"

const TAGS: { value: Tag; label: string }[] = [
  { value: "work", label: "Work" },
  { value: "sleep", label: "Sleep" },
  { value: "relationships", label: "Relationships" },
  { value: "fitness", label: "Fitness" },
  { value: "hobbies", label: "Hobbies" },
  { value: "other", label: "Other" },
]

interface TagsSelectorProps {
  value: Tag[]
  onChange: (tags: Tag[]) => void
}

export function TagsSelector({ value, onChange }: TagsSelectorProps) {
  function toggle(tag: Tag) {
    onChange(
      value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => (
        <button
          key={tag.value}
          type="button"
          onClick={() => toggle(tag.value)}
          className={cn(
            "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            value.includes(tag.value)
              ? "border-indigo-300 bg-indigo-100 text-indigo-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          )}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )
}
