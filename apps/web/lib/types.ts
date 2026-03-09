export type Mood =
  | "happy"
  | "calm"
  | "anxious"
  | "sad"
  | "overwhelmed"
  | "grateful"
  | "neutral"

export type Tag =
  | "work"
  | "sleep"
  | "relationships"
  | "fitness"
  | "hobbies"
  | "other"

export interface Entry {
  id: string
  userId: string
  mood: Mood | null
  tags: string[] | null
  note: string | null
  vibeCheck: string | null
  createdAt: string
  updatedAt: string
}
