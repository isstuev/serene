"use client"

import { useState, useEffect } from "react"
import { MoodSelector } from "@/components/mood/MoodSelector"
import { TagsSelector } from "@/components/journal/TagsSelector"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Entry, Mood, Tag } from "@/lib/types"

const MIN_NOTE_LENGTH = 50

interface EntryEditorProps {
  editingEntry?: Entry | null
  onSave: (entry: Entry) => void
  onCancelEdit?: () => void
}

export function EntryEditor({ editingEntry, onSave, onCancelEdit }: EntryEditorProps) {
  const [mood, setMood] = useState<Mood | null>(null)
  const [tags, setTags] = useState<Tag[]>([])
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill when editing
  useEffect(() => {
    if (editingEntry) {
      setMood((editingEntry.mood as Mood) ?? null)
      setTags((editingEntry.tags as Tag[]) ?? [])
      setNote(editingEntry.note ?? "")
    } else {
      setMood(null)
      setTags([])
      setNote("")
    }
    setError(null)
  }, [editingEntry])

  const isEditing = !!editingEntry
  const canSave = mood !== null && note.length >= MIN_NOTE_LENGTH

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave || saving) return

    setSaving(true)
    setError(null)
    try {
      const url = isEditing ? `/api/entries/${editingEntry!.id}` : "/api/entries"
      const method = isEditing ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, tags, note }),
      })
      if (!res.ok) {
        setError("Failed to save. Please try again.")
        return
      }
      const entry = await res.json()
      onSave(entry)
      if (!isEditing) {
        setMood(null)
        setTags([])
        setNote("")
      }
    } catch {
      setError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mood */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          How are you feeling?
        </label>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      {/* Tags */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          What&apos;s it about? <span className="text-slate-400">(optional)</span>
        </label>
        <TagsSelector value={tags} onChange={setTags} />
      </div>

      {/* Note */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">Your note</label>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              note.length < MIN_NOTE_LENGTH
                ? "text-slate-400"
                : "text-emerald-600"
            )}
          >
            {note.length < MIN_NOTE_LENGTH
              ? `${note.length} / ${MIN_NOTE_LENGTH} min`
              : `${note.length} chars`}
          </span>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's on your mind today…"
          rows={5}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5",
            "text-sm text-slate-800 placeholder:text-slate-400",
            "resize-none transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          )}
        />
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          type="submit"
          disabled={!canSave || saving}
          className="sm:w-auto"
        >
          {saving ? "Saving…" : isEditing ? "Update entry" : "Save entry"}
        </Button>
        {isEditing && onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={saving}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
