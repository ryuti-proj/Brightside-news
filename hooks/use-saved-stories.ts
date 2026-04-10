"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { SavedStory, SaveStoryInput } from "@/types/user-data"
import { fetchSavedStories, removeSavedStory, saveStory } from "@/lib/saved-stories-client"

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase()
}

export function buildSavedStoryId(story: Partial<SaveStoryInput>) {
  const normalizedStoryId = normalize(story.storyId)
  const normalizedUrl = normalize(story.url)
  const normalizedTitle = normalize(story.title)
  const normalizedSource = normalize(story.source)
  const normalizedCategory = normalize(story.category)

  if (normalizedUrl) {
    return `url:${normalizedUrl}`
  }

  if (normalizedStoryId.startsWith("url:") || normalizedStoryId.startsWith("meta:")) {
    return normalizedStoryId
  }

  return `meta:${normalizedTitle}|${normalizedSource}|${normalizedCategory}`
}

function getMatchKey(story: Partial<SaveStoryInput>) {
  return buildSavedStoryId(story)
}

export function useSavedStories(piUserId: string | null | undefined) {
  const [savedStories, setSavedStories] = useState<SavedStory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const loadSavedStories = useCallback(async () => {
    if (!piUserId) {
      setSavedStories([])
      setIsLoaded(true)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const data = await fetchSavedStories(piUserId)
      setSavedStories(Array.isArray(data) ? data : [])
      setIsLoaded(true)
    } finally {
      setIsLoading(false)
    }
  }, [piUserId])

  useEffect(() => {
    void loadSavedStories()
  }, [loadSavedStories])

  const savedKeys = useMemo(() => {
    const set = new Set<string>()

    savedStories.forEach((story) => {
      const key = getMatchKey(story)
      if (key) set.add(key)
    })

    return set
  }, [savedStories])

  const isSaved = useCallback(
    (story: Partial<SaveStoryInput>) => {
      const key = getMatchKey(story)
      return key ? savedKeys.has(key) : false
    },
    [savedKeys]
  )

  const addSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      if (!piUserId) {
        throw new Error("No user")
      }

      const payload: SaveStoryInput = {
        ...story,
        storyId: buildSavedStoryId(story),
      }

      const saved = await saveStory(piUserId, payload)
      const savedKey = getMatchKey(saved)

      setSavedStories((prev) => {
        const filtered = prev.filter((item) => getMatchKey(item) !== savedKey)
        return [saved, ...filtered]
      })

      return saved
    },
    [piUserId]
  )

  const deleteSavedStory = useCallback(
    async (story: string | Partial<SaveStoryInput>) => {
      if (!piUserId) {
        throw new Error("No user")
      }

      const storyPayload: Partial<SaveStoryInput> =
        typeof story === "string"
          ? { storyId: story }
          : {
              storyId: story.storyId ?? buildSavedStoryId(story),
              title: story.title,
              source: story.source,
              url: story.url,
              category: story.category,
            }

      const key = buildSavedStoryId(storyPayload)

      if (!key) {
        return false
      }

      const removed = await removeSavedStory(piUserId, storyPayload)

      if (removed) {
        setSavedStories((prev) => prev.filter((item) => getMatchKey(item) !== key))
      }

      return removed
    },
    [piUserId]
  )

  const toggleSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      const key = buildSavedStoryId(story)

      if (savedKeys.has(key)) {
        await deleteSavedStory({
          storyId: key,
          title: story.title,
          source: story.source ?? undefined,
          url: story.url ?? undefined,
          category: story.category ?? undefined,
        })
        return false
      }

      await addSavedStory({
        ...story,
        storyId: key,
      })

      return true
    },
    [addSavedStory, deleteSavedStory, savedKeys]
  )

  return {
    savedStories,
    isLoading,
    isLoaded,
    loadSavedStories,
    isSaved,
    addSavedStory,
    deleteSavedStory,
    toggleSavedStory,
  }
}