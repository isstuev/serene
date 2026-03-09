import { cn } from "@/lib/utils"
import type { Mood } from "@/lib/types"

const MOOD_STYLES: Record<Mood, { classes: string; emoji: string }> = {
  happy: { classes: "bg-amber-100 text-amber-700", emoji: "😊" },
  calm: { classes: "bg-teal-100 text-teal-700", emoji: "😌" },
  grateful: { classes: "bg-emerald-100 text-emerald-700", emoji: "🙏" },
  neutral: { classes: "bg-slate-100 text-slate-600", emoji: "😐" },
  anxious: { classes: "bg-orange-100 text-orange-700", emoji: "😰" },
  sad: { classes: "bg-blue-100 text-blue-700", emoji: "😢" },
  overwhelmed: { classes: "bg-rose-100 text-rose-700", emoji: "😵" },
}

interface MoodBadgeProps {
  mood: Mood
  size?: "sm" | "md"
}

export function MoodBadge({ mood, size = "sm" }: MoodBadgeProps) {
  const { classes, emoji } = MOOD_STYLES[mood]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium capitalize",
        classes,
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span className="leading-none">{emoji}</span>
      {mood}
    </span>
  )
}
