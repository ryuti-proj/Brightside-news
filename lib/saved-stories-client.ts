"use client"

import type { SavedStory, SaveStoryInput } from "@/types/user-data"

const BASE_URL = "/api/saved-stories"

async function handleResponse(res: Response) {
  if (!res.ok) {
    throw new Error("Request failed")
  }
  return res.json()
}

export async function fetchSavedStories(piUserId: string): Promise<SavedStory[]> {
  const res = await fetch(`${BASE_URL}?piUserId=${piUserId}`)
  return handleResponse(res)
}

export async function saveStory(
  piUserId: string,
  story: SaveStoryInput
): Promise<SavedStory> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      piUserId,
      story,
    }),
  })

  return handleResponse(res)
}

export async function removeSavedStory(
  piUserId: string,
  storyId: string
): Promise<boolean> {
  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      piUserId,
      storyId, // 👈 IMPORTANT: send EXACT SAME ID we saved
    }),
  })

  return handleResponse(res)
}

export async function checkStorySaved(
  piUserId: string,
  storyId: string
): Promise<boolean> {
  const res = await fetch(
    `${BASE_URL}/check?piUserId=${piUserId}&storyId=${encodeURIComponent(storyId)}`
  )

  const data = await handleResponse(res)
  return data.saved
}

export async function syncUserProfile(input: {
  piUserId: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}) {
  await fetch("/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  })
}