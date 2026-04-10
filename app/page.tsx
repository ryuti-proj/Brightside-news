"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DonationModal } from "@/components/donation-modal"
import { NewsCard } from "@/components/news-card"
import { categoryGroups, getCategoryGroup } from "@/lib/categories"
import NewsStreamService from "@/lib/news-stream"
import type { NewsArticle } from "@/lib/news-api"
import { useSavedStories } from "@/hooks/use-saved-stories"
import { syncUserProfile } from "@/lib/saved-stories-client"
import { Bookmark } from "lucide-react"

// ✅ NEW: stable ID generator
function getStableStoryId(article: NewsArticle) {
  return (
    article.url ||
    `${article.source || "unknown"}-${article.title}`
  )
}

export default function BrightSideNews() {
  const { user, isAuthenticated } = useAuth()

  const [news, setNews] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set())

  const piUserId = useMemo(() => {
    if (!user || typeof user !== "object") return null
    const u = user as any
    return u.piUserId || u.id || null
  }, [user])

  const { isSaved, toggleSavedStory } = useSavedStories(piUserId)

  useEffect(() => {
    const service = NewsStreamService.getInstance()

    service.startRealTimeStream((articles) => {
      setNews(articles)
      setIsLoading(false)
    })

    return () => service.stopRealTimeStream()
  }, [])

  // ✅ FIXED bookmark handler
  const handleBookmark = useCallback(
    async (article: NewsArticle) => {
      if (!piUserId) {
        alert("Please sign in to save stories.")
        return
      }

      const stableId = getStableStoryId(article)

      try {
        await toggleSavedStory({
          storyId: stableId,
          title: article.title,
          summary: article.excerpt,
          imageUrl: article.image || null,
          source: article.source || null,
          url: article.url || null,
          publishedAt: article.publishedAt || null,
          category: article.category || null,
        })
      } catch (error) {
        console.error(error)
        alert("Failed to save story")
      }
    },
    [piUserId, toggleSavedStory]
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((article) => {
        const stableId = getStableStoryId(article)

        return (
          <NewsCard
            key={stableId} // ✅ FIXED key
            article={article}
            onArticleClick={() => {}}
            onLike={(id) => {
              setLikedArticles((prev) => {
                const s = new Set(prev)
                s.has(id) ? s.delete(id) : s.add(id)
                return s
              })
            }}
            onShare={() => {}}
            onBookmark={handleBookmark}
            isLiked={likedArticles.has(article.id)}
            isBookmarked={isSaved(stableId)} // ✅ FIXED
          />
        )
      })}
    </div>
  )
}