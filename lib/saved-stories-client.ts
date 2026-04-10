import type { NewsUser, SavedStory, SaveStoryInput } from "@/types/user-data"

type UserPayload = {
  ok: boolean
  user: NewsUser | null
  error?: string
}

type SavedStoriesPayload = {
  ok: boolean
  savedStories: SavedStory[]
  error?: string
}

type SavedStoryPayload = {
  ok: boolean
  savedStory?: SavedStory
  saved?: boolean
  removed?: boolean
  error?: string
}

function normalizePiUserId(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()

  if (!trimmed) return null

  if (/^pi-[^\s]+$/i.test(trimmed)) {
    return trimmed.replace(/^pi-/i, "")
  }

  return trimmed
}

function normalizeStoryValue(value: unknown): string {
  if (typeof value !== "string") return ""

  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "")
    .replace(/\s+/g, " ")
}

function slugifyStoryValue(value: string): string {
  return normalizeStoryValue(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function createStoryKey(input: {
  storyId?: string | null
  title?: string | null
  source?: string | null
  url?: string | null
  publishedAt?: string | null
}) {
  const normalizedUrl = normalizeStoryValue(input.url)
  const normalizedTitle = normalizeStoryValue(input.title)
  const normalizedSource = normalizeStoryValue(input.source)
  const normalizedPublishedAt = normalizeStoryValue(input.publishedAt)
  const normalizedStoryId = normalizeStoryValue(input.storyId)

  if (normalizedUrl) {
    return `url:${slugifyStoryValue(normalizedUrl)}`
  }

  if (normalizedTitle && normalizedSource) {
    const publishedSegment = normalizedPublishedAt ? `:${slugifyStoryValue(normalizedPublishedAt)}` : ""
    return `meta:${slugifyStoryValue(normalizedSource)}:${slugifyStoryValue(normalizedTitle)}${publishedSegment}`
  }

  if (normalizedTitle) {
    return `title:${slugifyStoryValue(normalizedTitle)}`
  }

  if (normalizedStoryId) {
    return `id:${slugifyStoryValue(normalizedStoryId)}`
  }

  return ""
}

function requirePiUserId(piUserId: string) {
  const normalizedPiUserId = normalizePiUserId(piUserId)

  if (!normalizedPiUserId) {
    throw new Error("Missing Pi user ID.")
  }

  return normalizedPiUserId
}

function buildAuthHeaders(piUserId: string) {
  return {
    "Content-Type": "application/json",
    "x-pi-user-id": requirePiUserId(piUserId),
  }
}

export async function syncUserProfile(input: {
  piUserId: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}) {
  const response = await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      piUserId: requirePiUserId(input.piUserId),
    }),
  })

  const data = (await response.json()) as UserPayload

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Failed to sync user profile.")
  }

  return data.user
}

export async function fetchCurrentUser(piUserId: string) {
  const response = await fetch("/api/user", {
    method: "GET",
    headers: buildAuthHeaders(piUserId),
    cache: "no-store",
  })

  const data = (await response.json()) as UserPayload

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Failed to fetch current user.")
  }

  return data.user
}

export async function fetchSavedStories(piUserId: string) {
  const response = await fetch("/api/saved-stories", {
    method: "GET",
    headers: buildAuthHeaders(piUserId),
    cache: "no-store",
  })

  const data = (await response.json()) as SavedStoriesPayload

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Failed to fetch saved stories.")
  }

  return data.savedStories
}

export async function saveStory(piUserId: string, story: SaveStoryInput) {
  const response = await fetch("/api/saved-stories", {
    method: "POST",
    headers: buildAuthHeaders(piUserId),
    body: JSON.stringify({
      ...story,
      storyId: createStoryKey(story),
    }),
  })

  const data = (await response.json()) as SavedStoryPayload

  if (!response.ok || !data.ok || !data.savedStory) {
    throw new Error(data.error || "Failed to save story.")
  }

  return data.savedStory
}

export async function checkStorySaved(piUserId: string, storyId: string) {
  const response = await fetch(`/api/saved-stories/${encodeURIComponent(storyId)}`, {
    method: "GET",
    headers: buildAuthHeaders(piUserId),
    cache: "no-store",
  })

  const data = (await response.json()) as SavedStoryPayload

  if (!response.ok || !data.ok || typeof data.saved !== "boolean") {
    throw new Error(data.error || "Failed to check saved story.")
  }

  return data.saved
}

export async function removeSavedStory(piUserId: string, storyId: string) {
  const response = await fetch(`/api/saved-stories/${encodeURIComponent(storyId)}`, {
    method: "DELETE",
    headers: buildAuthHeaders(piUserId),
  })

  const data = (await response.json()) as SavedStoryPayload

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "Failed to remove saved story.")
  }

  return Boolean(data.removed)
}
