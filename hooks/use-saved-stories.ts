"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { SavedStory, SaveStoryInput } from "@/types/user-data"
import {
  checkStorySaved,
  fetchSavedStories,
  removeSavedStory,
  saveStory,
} from "@/lib/saved-stories-client"

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
    (storyId: string) => {
      return savedStoryIds.has(storyId)
    },
    [savedStoryIds]
  )

  const refreshSavedState = useCallback(
    async (storyId: string) => {
      if (!piUserId) return false
      return checkStorySaved(piUserId, storyId)
    },
    [piUserId]
  )

  const addSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      if (!piUserId) {
        throw new Error("User is not signed in.")
      }

      const saved = await saveStory(piUserId, story)

      setSavedStories((current) => {
        const filtered = current.filter((item) => item.storyId !== saved.storyId)
        return [saved, ...filtered]
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

      const removed = await removeSavedStory(piUserId, storyId)

      if (removed) {
        setSavedStories((current) => current.filter((item) => item.storyId !== storyId))
      }

      return removed
    },
    [piUserId]
  )

  const toggleSavedStory = useCallback(
    async (story: SaveStoryInput) => {
      if (isSaved(story.storyId)) {
        await deleteSavedStory(story.storyId)
        return false
      }

      await addSavedStory(story)
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