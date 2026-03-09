"use client"

import { useEffect, useState, useRef } from "react"
import { Sparkles } from "lucide-react"
import type { Mood, Tag } from "@/lib/types"

interface VibeCheckPanelProps {
  mood: Mood
  tags: Tag[]
  note: string
  onComplete: (vibeCheck: string) => void
}

export function VibeCheckPanel({ mood, tags, note, onComplete }: VibeCheckPanelProps) {
  const [text, setText] = useState("")
  const [done, setDone] = useState(false)
  const calledRef = useRef(false)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    async function stream() {
      try {
        const res = await fetch("/api/vibe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, tags, note }),
        })

        if (!res.ok || !res.body) {
          setText("Couldn't get a vibe check right now.")
          setDone(true)
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let full = ""

        while (true) {
          const { done: streamDone, value } = await reader.read()
          if (streamDone) break
          const chunk = decoder.decode(value, { stream: true })
          full += chunk
          setText(full)
        }

        setDone(true)
        if (full.trim()) {
          onComplete(full)
        } else {
          setText("Couldn't get a vibe check right now.")
        }
      } catch {
        setText("Couldn't get a vibe check right now.")
        setDone(true)
      }
    }

    stream()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
          Vibe check
        </p>
      </div>
      <p className="text-sm leading-relaxed text-indigo-700">
        {text || <span className="text-indigo-300">Checking your vibe…</span>}
        {!done && text && (
          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-indigo-400" />
        )}
      </p>
    </div>
  )
}
