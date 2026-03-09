import { streamText } from "ai"
import { auth } from "@/lib/auth"
import { anthropic, VIBE_MODEL, SYSTEM_PROMPT } from "@/lib/ai"

const CRISIS_KEYWORDS = [
  "suicide",
  "kill myself",
  "self-harm",
  "self harm",
  "hurt myself",
  "end my life",
  "end it all",
  "want to die",
  "don't want to live",
  "dont want to live",
]

const CRISIS_RESPONSE =
  "It sounds like you might be going through a really tough time. Please reach out to a mental health professional or contact a crisis line such as 988 (US) or Crisis Text Line (text HOME to 741741)."

const NUDGE_RESPONSE =
  "Tell me a bit more so I can offer a better vibe check."

const GIBBERISH_RESPONSE =
  "I didn't quite catch that — try writing out how you're feeling in a few words."

function hasCrisisKeywords(text: string): boolean {
  const lower = text.toLowerCase()
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw))
}

function isGibberish(text: string): boolean {
  const hasVowels = /[aeiou]/i.test(text)
  if (!hasVowels) return true
  const alphaCount = (text.match(/[a-z]/gi) ?? []).length
  if (alphaCount === 0) return true
  const nonAlphaCount = text.length - alphaCount
  return nonAlphaCount / text.length > 0.8
}

function staticText(text: string) {
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const body = await req.json()
  const note: string = body.note ?? ""
  const mood: string = body.mood ?? ""
  const tags: string[] = body.tags ?? []

  // Safety check 1: too short
  if (note.trim().length < 10) {
    return staticText(NUDGE_RESPONSE)
  }

  // Safety check 2: crisis keywords
  if (hasCrisisKeywords(note)) {
    return staticText(CRISIS_RESPONSE)
  }

  // Safety check 3: gibberish
  if (isGibberish(note)) {
    return staticText(GIBBERISH_RESPONSE)
  }

  const userMessage = `Mood: ${mood}\nTags: ${tags.join(", ") || "none"}\nJournal note: ${note}`

  const result = streamText({
    model: anthropic(VIBE_MODEL),
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  })

  return result.toTextStreamResponse()
}
