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

function buildAuthHeaders(piUserId: string) {
  return {
    "Content-Type": "application/json",
    "x-pi-user-id": piUserId,
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
    body: JSON.stringify(input),
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
    body: JSON.stringify(story),
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