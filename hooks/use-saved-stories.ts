"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { SavedStory, SaveStoryInput } from "@/types/user-data"
import { fetchSavedStories, removeSavedStory, saveStory } from "@/lib/saved-stories-client"

function normalizeSavedValue(value: string | null | undefined) {
  return (value || "").trim().toLowerCase()
}

export function buildSavedStoryId(story: Partial<SaveStoryInput>) {
  const normalizedUrl = normalizeSavedValue(story.url)
  const normalizedTitle = normalizeSavedValue(story.title)
  const normalizedSource = normalizeSavedValue(story.source)
  const normalizedCategory = normalizeSavedValue(story.category)

  if (normalizedUrl) {
    return `url:${normalizedUrl}`
  }

  return `meta:${normalizedTitle}|${normalizedSource}|${normalizedCategory}`
}

function buildSavedStoryFingerprint(story: Partial<SaveStoryInput>) {
  const normalizedStoryId = normalizeSavedValue(story.storyId)

  if (normalizedStoryId.startsWith("url:") || normalizedStoryId.startsWith("meta:")) {
    return normalizedStoryId
  }

  return buildSavedStoryId(story)
}

function findMatchingSavedStory(savedStories: SavedStory[], storyOrId: string | Partial<SaveStoryInput>) {
  if (typeof storyOrId === "string") {
    const normalizedStoryId = normalizeSavedValue(storyOrId)

    return (
      savedStories.find((story) => normalizeSavedValue(story.storyId) === normalizedStoryId) ?? null
    )
  }

  const targetFingerprint = buildSavedStoryFingerprint(storyOrId)

  return (
    savedStories.find((story) => buildSavedStoryFingerprint(story) === targetFingerprint) ?? null
  )
}

export function useSavedStories(piUserId: string | null | undefined) {
  const [savedStories, setSavedStories] = useState<SavedStory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadSavedStories = useCallback(async () => {
    if (!piUserId) {
      setSavedStories([])
      setIsLoaded(true)
      return
    }

    setIsLoading(true)

    try {
      const stories = await fetchSavedStories(piUserId)
      setSavedStories(stories)
      setIsLoaded(true)
    } finally {
      setIsLoading(false)
    }
  }, [piUserId])

  useEffect(() => {
    void loadSavedStories()
  }, [loadSavedStories])

  const savedStoryIds = useMemo(() => {
    return new Set(savedStories.map((story) => story.storyId))
  }, [savedStories])

  const isSaved = useCallback(
    (storyOrId: string | Partial<SaveStoryInput>) => {
      return Boolean(findMatchingSavedStory(savedStories, storyOrId))
    },
    [savedStories]
  )

  const addSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      if (!piUserId) {
        throw new Error("User is not signed in.")
      }

      const normalizedStory: SaveStoryInput = {
        ...story,
        storyId: buildSavedStoryId(story),
      }

      const saved = await saveStory(piUserId, normalizedStory)

      setSavedStories((current) => {
        const existing = findMatchingSavedStory(current, normalizedStory)
        const filtered = existing
          ? current.filter((item) => item.id !== existing.id)
          : current.filter((item) => item.storyId !== saved.storyId)

        return [saved, ...filtered]
      })

      return saved
    },
    [piUserId]
  )

  const deleteSavedStory = useCallback(
    async (storyOrId: string | Partial<SaveStoryInput> | SavedStory) => {
      if (!piUserId) {
        throw new Error("User is not signed in.")
      }

      const existing = findMatchingSavedStory(savedStories, storyOrId)
      const storyIdToDelete = typeof storyOrId === "string" ? storyOrId : existing?.storyId || storyOrId.storyId

      if (!storyIdToDelete) {
        return false
      }

      const removed = await removeSavedStory(piUserId, storyIdToDelete)

      if (removed) {
        setSavedStories((current) => {
          const matched = findMatchingSavedStory(current, storyOrId)

          if (matched) {
            return current.filter((item) => item.id !== matched.id)
          }

          return current.filter((item) => item.storyId !== storyIdToDelete)
        })
      } else {
        await loadSavedStories()
      }

      return removed
    },
    [loadSavedStories, piUserId, savedStories]
  )

  const toggleSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      const existing = findMatchingSavedStory(savedStories, story)

      if (existing) {
        await deleteSavedStory(existing)
        return false
      }

      await addSavedStory(story)
      return true
    },
    [addSavedStory, deleteSavedStory, savedStories]
  )

  return {
    savedStories,
    savedStoryIds,
    isLoading,
    isLoaded,
    isSaved,
    loadSavedStories,
    addSavedStory,
    deleteSavedStory,
    toggleSavedStory,
  }
}
