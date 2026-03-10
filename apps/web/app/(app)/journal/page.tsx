"use client"

import { useState, useEffect, useCallback } from "react"
import { EntryEditor } from "@/components/journal/EntryEditor"
import { EntryTimeline } from "@/components/journal/EntryTimeline"
import { DeleteConfirmModal } from "@/components/journal/DeleteConfirmModal"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import type { Entry } from "@/lib/types"

function TimelineSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading entries">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-16 rounded-full bg-slate-100" />
            <div className="h-5 w-12 rounded-full bg-slate-100" />
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded bg-slate-100 w-full" />
            <div className="h-3 rounded bg-slate-100 w-4/5" />
            <div className="h-3 rounded bg-slate-100 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchEntries = useCallback(async () => {
    setLoadError(false)
    try {
      const res = await fetch("/api/entries")
      if (res.ok) {
        setEntries(await res.json())
      } else {
        setLoadError(true)
      }
    } catch {
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  function handleSave(savedEntry: Entry) {
    setEntries((prev) => {
      const exists = prev.some((e) => e.id === savedEntry.id)
      if (exists) return prev.map((e) => (e.id === savedEntry.id ? savedEntry : e))
      return [savedEntry, ...prev]
    })
    if (editingEntry?.id === savedEntry.id) setEditingEntry(null)
  }

  function handleEdit(entry: Entry) {
    setEditingEntry(entry)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function handleDeleteConfirm() {
    if (!deletingId) return
    setDeleting(true)
    const res = await fetch(`/api/entries/${deletingId}`, { method: "DELETE" })
    if (res.ok || res.status === 204) {
      setEntries((prev) => prev.filter((e) => e.id !== deletingId))
    }
    setDeleting(false)
    setDeletingId(null)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Editor */}
      <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-slate-800">
          {editingEntry ? "Edit entry" : "New entry"}
        </h2>
        <ErrorBoundary>
          <EntryEditor
            editingEntry={editingEntry}
            onSave={handleSave}
            onCancelEdit={() => setEditingEntry(null)}
          />
        </ErrorBoundary>
      </div>

      {/* Timeline */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Your journal
        </h2>
        {loading ? (
          <TimelineSkeleton />
        ) : loadError ? (
          <div className="rounded-xl bg-rose-50 px-4 py-6 text-center">
            <p className="text-sm text-rose-700">Could not load entries.</p>
            <button
              onClick={() => { setLoading(true); fetchEntries() }}
              className="mt-3 text-xs text-rose-500 underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : (
          <EntryTimeline
            entries={entries}
            onEdit={handleEdit}
            onDelete={(id) => setDeletingId(id)}
          />
        )}
      </section>

      <DeleteConfirmModal
        isOpen={!!deletingId}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingId(null)}
        loading={deleting}
      />
    </div>
  )
}
