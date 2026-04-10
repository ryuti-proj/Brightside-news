"use client"

import type { SavedStory, SaveStoryInput } from "@/types/user-data"

const BASE_URL = "/api/saved-stories"

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

export async function fetchSavedStories(piUserId: string): Promise<SavedStory[]> {
  const response = await fetch(`${BASE_URL}?piUserId=${encodeURIComponent(piUserId)}`, {
    method: "GET",
    cache: "no-store",
  })

  return handleResponse<SavedStory[]>(response)
}

export async function saveStory(piUserId: string, story: SaveStoryInput): Promise<SavedStory> {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      piUserId,
      story,
    }),
  })

  return handleResponse<SavedStory>(response)
}

export async function removeSavedStory(piUserId: string, storyId: string): Promise<boolean> {
  const response = await fetch(BASE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      piUserId,
      storyId,
    }),
  })

  const data = await handleResponse<{ success?: boolean; removed?: boolean }>(response)

  return Boolean(data?.success ?? data?.removed)
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