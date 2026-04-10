"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { SavedStory, SaveStoryInput } from "@/types/user-data"
import {
  fetchSavedStories,
  removeSavedStory,
  saveStory,
} from "@/lib/saved-stories-client"

function normalize(value: string | null | undefined) {
  return (value || "").trim().toLowerCase()
}

// 🔑 ALWAYS prefer URL as primary identity
function getPrimaryKey(story: Partial<SaveStoryInput>) {
  return normalize(story.url) || normalize(story.title)
}

export function useSavedStories(piUserId: string | null | undefined) {
  const [savedStories, setSavedStories] = useState<SavedStory[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!piUserId) return

    fetchSavedStories(piUserId).then((data) => {
      setSavedStories(data)
      setIsLoaded(true)
    })
  }, [piUserId])

  // 🔑 Build lookup by URL/title (NOT storyId)
  const savedKeys = useMemo(() => {
    const set = new Set<string>()

    savedStories.forEach((story) => {
      const key = getPrimaryKey(story)
      if (key) set.add(key)
    })

    return set
  }, [savedStories])

  const isSaved = useCallback(
    (story: Partial<SaveStoryInput>) => {
      const key = getPrimaryKey(story)
      return key ? savedKeys.has(key) : false
    },
    [savedKeys]
  )

  const addSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      if (!piUserId) throw new Error("No user")

      const saved = await saveStory(piUserId, story)

      setSavedStories((prev) => {
        const key = getPrimaryKey(saved)

        // remove duplicates by URL/title
        const filtered = prev.filter(
          (s) => getPrimaryKey(s) !== key
        )

        return [saved, ...filtered]
      })
    },
    [piUserId]
  )

  const deleteSavedStory = useCallback(
    async (story: Partial<SaveStoryInput>) => {
      if (!piUserId) throw new Error("No user")

      const key = getPrimaryKey(story)

      const match = savedStories.find(
        (s) => getPrimaryKey(s) === key
      )

      if (!match) return false

      await removeSavedStory(piUserId, match.storyId)

      setSavedStories((prev) =>
        prev.filter((s) => getPrimaryKey(s) !== key)
      )

      return true
    },
    [piUserId, savedStories]
  )

  const toggleSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      if (isSaved(story)) {
        await deleteSavedStory(story)
        return false
      } else {
        await addSavedStory(story)
        return true
      }
    },
    [isSaved, addSavedStory, deleteSavedStory]
  )

  return {
    savedStories,
    isLoaded,
    isSaved,
    toggleSavedStory,
    deleteSavedStory,
  }
}