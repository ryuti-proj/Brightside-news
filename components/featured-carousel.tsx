"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import type { NewsArticle } from "@/lib/news-api"

interface FeaturedCarouselProps {
  news: NewsArticle[]
  featuredCategories: string[]
  onArticleClick: (article: NewsArticle) => void
  onLike: (articleId: string) => void
  onShare: (article: NewsArticle) => void
  likedArticles: Set<string>
}

export function FeaturedCarousel({
  news,
  featuredCategories,
  onArticleClick,
  onLike,
  onShare,
  likedArticles,
}: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Get featured stories from selected categories
  const featuredStories = useMemo(() => {
    const stories = news
      .filter((article) =>
        featuredCategories.length > 0 ? featuredCategories.includes(article.category) : article.isFeatured,
      )
      .slice(0, 3) // Limit to 3 stories for better performance

    return stories.length > 0 ? stories : news.slice(0, 3)
  }, [news, featuredCategories])

  // Auto-advance carousel
  useEffect(() => {
    if (featuredStories.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredStories.length)
    }, 15000) // 15 seconds

    return () => clearInterval(interval)
  }, [featuredStories.length, isPaused])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredStories.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredStories.length) % featuredStories.length)
  }

  if (featuredStories.length === 0) {
    return null
  }

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="overflow-hidden rounded-lg">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {featuredStories.map((article) => (
            <div key={article.id} className="w-full flex-shrink-0">
              <Card className="border-sky-200 overflow-hidden">
                <div className="relative">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover"
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src =
                        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop&auto=format&q=80"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Navigation Arrows */}
                  {featuredStories.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          prevSlide()
                        }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
                        onClick={(e) => {
                          e.stopPropagation()
                          nextSlide()
                        }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge className="bg-sky-600 text-white">Featured</Badge>
                      <Badge variant="outline" className="border-white/30 text-white bg-white/10">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">{article.source}</span>
                      </div>
                    </div>

                    <h3
                      className="text-2xl font-bold mb-2 cursor-pointer hover:text-sky-200 transition-colors line-clamp-2"
                      onClick={() => onArticleClick(article)}
                    >
                      {article.title}
                    </h3>

                    <p className="text-white/90 mb-4 line-clamp-2 leading-relaxed">{article.excerpt}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 p-0 h-auto"
                          onClick={(e) => {
                            e.stopPropagation()
                            onLike(article.id)
                          }}
                        >
                          <Heart
                            className={`w-5 h-5 mr-2 ${
                              likedArticles.has(article.id) ? "fill-red-400 text-red-400" : "text-white"
                            }`}
                          />
                          <span>{article.likes + (likedArticles.has(article.id) ? 1 : 0)}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 p-0 h-auto"
                          onClick={(e) => {
                            e.stopPropagation()
                            onShare(article)
                          }}
                        >
                          <Share2 className="w-5 h-5 mr-2" />
                          Share
                        </Button>
                      </div>

                      <Button
                        onClick={() => onArticleClick(article)}
                        className="bg-sky-600 hover:bg-sky-700 text-white"
                      >
                        Read More
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      {featuredStories.length > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {featuredStories.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-sky-600" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Category Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {featuredStories.map((article) => (
          <Badge
            key={article.category}
            variant="outline"
            className="cursor-pointer hover:bg-sky-50 border-sky-200 text-sky-700"
            onClick={() => onArticleClick(article)}
          >
            {article.category}
          </Badge>
        ))}
      </div>
    </div>
  )
}
