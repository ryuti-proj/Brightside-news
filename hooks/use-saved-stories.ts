"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { SavedStory, SaveStoryInput } from "@/types/user-data"
import {
  checkStorySaved,
  createStoryKey,
  fetchSavedStories,
  removeSavedStory,
  saveStory,
} from "@/lib/saved-stories-client"

function getStorageKey(piUserId: string) {
  return `brightside-saved-stories:${piUserId}`
}

function dedupeSavedStories(stories: SavedStory[]) {
  const deduped = new Map<string, SavedStory>()

  for (const story of stories) {
    const key = createStoryKey(story)

    if (!key) continue

    const existing = deduped.get(key)

    if (!existing) {
      deduped.set(key, {
        ...story,
        storyId: key,
      })
      continue
    }

    const existingSavedAt = new Date(existing.savedAt).getTime()
    const nextSavedAt = new Date(story.savedAt).getTime()

    if (Number.isNaN(existingSavedAt) || nextSavedAt >= existingSavedAt) {
      deduped.set(key, {
        ...existing,
        ...story,
        storyId: key,
      })
    }
  }

  return Array.from(deduped.values()).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )
}

function readSavedStoriesCache(piUserId: string) {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(getStorageKey(piUserId))
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return dedupeSavedStories(parsed as SavedStory[])
  } catch {
    return []
  }
}

function writeSavedStoriesCache(piUserId: string, stories: SavedStory[]) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(getStorageKey(piUserId), JSON.stringify(dedupeSavedStories(stories)))
  } catch {
    // Ignore storage write issues
  }
}

export function useSavedStories(piUserId: string | null | undefined) {
  const [savedStories, setSavedStories] = useState<SavedStory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!piUserId) {
      setSavedStories([])
      setIsLoaded(true)
      return
    }

    const cachedStories = readSavedStoriesCache(piUserId)

    if (cachedStories.length > 0) {
      setSavedStories(cachedStories)
      setIsLoaded(true)
    }
  }, [piUserId])

  const loadSavedStories = useCallback(async () => {
    if (!piUserId) {
      setSavedStories([])
      setIsLoaded(true)
      return
    }

    setIsLoading(true)

    try {
      const cachedStories = readSavedStoriesCache(piUserId)
      const backendStories = dedupeSavedStories(await fetchSavedStories(piUserId))
      const mergedStories = dedupeSavedStories([...backendStories, ...cachedStories])

      setSavedStories(mergedStories)
      writeSavedStoriesCache(piUserId, mergedStories)
      setIsLoaded(true)

      const missingFromBackend = mergedStories.filter((story) => {
        const key = createStoryKey(story)
        return key && !backendStories.some((backendStory) => createStoryKey(backendStory) === key)
      })

      if (missingFromBackend.length > 0) {
        const restoredStories = await Promise.all(
          missingFromBackend.map((story) => saveStory(piUserId, story))
        )

        const nextStories = dedupeSavedStories([...backendStories, ...restoredStories])
        setSavedStories(nextStories)
        writeSavedStoriesCache(piUserId, nextStories)
      }
    } finally {
      setIsLoading(false)
    }
  }, [piUserId])

  useEffect(() => {
    void loadSavedStories()
  }, [loadSavedStories])

  const savedStoryIds = useMemo(() => {
    return new Set(savedStories.map((story) => createStoryKey(story)).filter(Boolean))
  }, [savedStories])

  const isSaved = useCallback(
    (storyId: string) => {
      const canonicalStoryId = createStoryKey({ storyId }) || storyId
      return savedStoryIds.has(canonicalStoryId)
    },
    [savedStoryIds]
  )

  const refreshSavedState = useCallback(
    async (storyId: string) => {
      if (!piUserId) return false
      const canonicalStoryId = createStoryKey({ storyId }) || storyId
      return checkStorySaved(piUserId, canonicalStoryId)
    },
    [piUserId]
  )

  const addSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      if (!piUserId) {
        throw new Error("User is not signed in.")
      }

      const canonicalStoryId = createStoryKey(story)

      if (!canonicalStoryId) {
        throw new Error("Story is missing a stable identifier.")
      }

      const saved = await saveStory(piUserId, {
        ...story,
        storyId: canonicalStoryId,
      })

      setSavedStories((current) => {
        const nextStories = dedupeSavedStories([
          saved,
          ...current.filter((item) => createStoryKey(item) !== canonicalStoryId),
        ])

        writeSavedStoriesCache(piUserId, nextStories)
        return nextStories
      })

      return saved
    },
    [piUserId]
  )

  const deleteSavedStory = useCallback(
    async (storyId: string) => {
      if (!piUserId) {
        throw new Error("User is not signed in.")
      }

      const canonicalStoryId = createStoryKey({ storyId }) || storyId
      const removed = await removeSavedStory(piUserId, canonicalStoryId)

      if (removed) {
        setSavedStories((current) => {
          const nextStories = current.filter((item) => createStoryKey(item) !== canonicalStoryId)
          writeSavedStoriesCache(piUserId, nextStories)
          return nextStories
        })
      }

      return removed
    },
    [piUserId]
  )

  const toggleSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      const canonicalStoryId = createStoryKey(story)

      if (!canonicalStoryId) {
        throw new Error("Story is missing a stable identifier.")
      }

      if (isSaved(canonicalStoryId)) {
        await deleteSavedStory(canonicalStoryId)
        return false
      }

      await addSavedStory({
        ...story,
        storyId: canonicalStoryId,
      })
      return true
    },
    [addSavedStory, deleteSavedStory, isSaved]
  )

  return {
    savedStories,
    savedStoryIds,
    isLoading,
    isLoaded,
    isSaved,
    loadSavedStories,
    refreshSavedState,
    addSavedStory,
    deleteSavedStory,
    toggleSavedStory,
  }
}
