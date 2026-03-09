"use client"

import { useState, useEffect, useCallback } from "react"
import { EntryEditor } from "@/components/journal/EntryEditor"
import { EntryTimeline } from "@/components/journal/EntryTimeline"
import { DeleteConfirmModal } from "@/components/journal/DeleteConfirmModal"
import type { Entry } from "@/lib/types"

export default function JournalPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/entries")
    if (res.ok) {
      setEntries(await res.json())
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  function handleSave(savedEntry: Entry) {
    if (editingEntry) {
      setEntries((prev) =>
        prev.map((e) => (e.id === savedEntry.id ? savedEntry : e))
      )
      setEditingEntry(null)
    } else {
      setEntries((prev) => [savedEntry, ...prev])
    }
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
        <EntryEditor
          editingEntry={editingEntry}
          onSave={handleSave}
          onCancelEdit={() => setEditingEntry(null)}
        />
      </div>

      {/* Timeline */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Your journal
        </h2>
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Loading…
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
