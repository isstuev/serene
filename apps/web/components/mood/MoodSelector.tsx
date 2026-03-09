"use client"

import { cn } from "@/lib/utils"
import type { Mood } from "@/lib/types"

const MOODS: {
  value: Mood
  label: string
  emoji: string
  selectedClasses: string
}[] = [
  {
    value: "happy",
    label: "Happy",
    emoji: "😊",
    selectedClasses: "ring-amber-400 bg-amber-50 border-amber-200",
  },
  {
    value: "calm",
    label: "Calm",
    emoji: "😌",
    selectedClasses: "ring-teal-400 bg-teal-50 border-teal-200",
  },
  {
    value: "grateful",
    label: "Grateful",
    emoji: "🙏",
    selectedClasses: "ring-emerald-400 bg-emerald-50 border-emerald-200",
  },
  {
    value: "neutral",
    label: "Neutral",
    emoji: "😐",
    selectedClasses: "ring-slate-400 bg-slate-50 border-slate-200",
  },
  {
    value: "anxious",
    label: "Anxious",
    emoji: "😰",
    selectedClasses: "ring-orange-400 bg-orange-50 border-orange-200",
  },
  {
    value: "sad",
    label: "Sad",
    emoji: "😢",
    selectedClasses: "ring-blue-400 bg-blue-50 border-blue-200",
  },
  {
    value: "overwhelmed",
    label: "Overwhelmed",
    emoji: "😵",
    selectedClasses: "ring-rose-400 bg-rose-50 border-rose-200",
  },
]

interface MoodSelectorProps {
  value: Mood | null
  onChange: (mood: Mood) => void
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {MOODS.map((mood) => (
        <button
          key={mood.value}
          type="button"
          onClick={() => onChange(mood.value)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-2.5 text-center transition-all",
            value === mood.value
              ? cn("ring-2 border-transparent", mood.selectedClasses)
              : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"
          )}
        >
          <span className="text-2xl leading-none">{mood.emoji}</span>
          <span className="text-xs font-medium text-slate-600 leading-tight">
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  )
}
