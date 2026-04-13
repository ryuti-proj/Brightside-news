"use client"

import type { SavedStory, SaveStoryInput } from "@/types/user-data"

const BASE_URL = "/api/saved-stories"

type RemoveSavedStoryInput =
  | string
  | {
      storyId?: string | null
      title?: string | null
      source?: string | null
      url?: string | null
      category?: string | null
    }

async function parseJsonSafe(response: Response) {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await parseJsonSafe(response)

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed"

    throw new Error(message)
  }

  return data as T
}

function withUserHeaders(piUserId: string, extraHeaders?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-pi-user-id": piUserId,
    ...(extraHeaders || {}),
  }
}

export async function fetchSavedStories(piUserId: string): Promise<SavedStory[]> {
  const response = await fetch(BASE_URL, {
    method: "GET",
    cache: "no-store",
    headers: withUserHeaders(piUserId),
  })

  const data = await handleResponse<{ stories?: SavedStory[] }>(response)
  return Array.isArray(data?.stories) ? data.stories : []
}

export async function saveStory(piUserId: string, story: SaveStoryInput): Promise<SavedStory> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: withUserHeaders(piUserId),
    body: JSON.stringify(story),
  })

  const data = await handleResponse<{ story: SavedStory }>(response)
  return data.story
}

export async function removeSavedStory(
  piUserId: string,
  story: RemoveSavedStoryInput
): Promise<boolean> {
  const storyId =
    typeof story === "string"
      ? story
      : typeof story?.storyId === "string" && story.storyId.trim()
        ? story.storyId.trim()
        : null

  if (!storyId) {
    throw new Error("storyId is required")
  }

  const response = await fetch(`${BASE_URL}/${encodeURIComponent(storyId)}`, {
    method: "DELETE",
    headers: withUserHeaders(piUserId),
  })

  const data = await handleResponse<{ ok?: boolean; removed?: boolean }>(response)
  return Boolean(data?.removed)
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

  return handleResponse(response)
}