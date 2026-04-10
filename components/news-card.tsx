"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Share2, MessageCircle, Clock, Calendar, MapPin, Bookmark, ExternalLink } from "lucide-react"
import { getCategoryGroup } from "@/lib/categories"
import type { NewsArticle } from "@/lib/news-api"

interface NewsCardProps {
  article: NewsArticle
  onArticleClick: (article: NewsArticle) => void
  onLike: (articleId: string) => void
  onShare: (article: NewsArticle) => void
  onBookmark: (article: NewsArticle) => void
  isLiked: boolean
  isBookmarked: boolean
}

export const NewsCard = memo(function NewsCard({
  article,
  onArticleClick,
  onLike,
  onShare,
  onBookmark,
  isLiked,
  isBookmarked,
}: NewsCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-white border-sky-100 hover:border-sky-200"
      onClick={() => onArticleClick(article)}
    >
      <div className="relative">
        <img
          src={article.image || "/placeholder.svg"}
          alt={article.title}
          className="w-full h-48 object-cover rounded-t-lg"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src =
              "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop&auto=format&q=80"
          }}
        />
        {article.isFeatured && <Badge className="absolute top-2 left-2 bg-sky-600 text-white">Featured</Badge>}
        {article.publishedAt === "Just now" && (
          <Badge className="absolute top-2 right-12 bg-green-600 text-white">Live</Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation()
            onBookmark(article)
          }}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-sky-600 text-sky-600" : "text-gray-600"}`} />
        </Button>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge variant="outline" className="text-xs border-sky-200 text-sky-700 shrink-0">
            {article.category}
          </Badge>
          <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 shrink-0">
            {getCategoryGroup(article.category)}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{article.country}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          <ExternalLink className="w-3 h-3" />
          <span className="truncate">Source: {article.source}</span>
          <span>•</span>
          <span className="truncate">By {article.author}</span>
        </div>

        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">{article.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">{article.excerpt}</p>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{article.readTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{article.publishedAt}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-auto"
              onClick={(e) => {
                e.stopPropagation()
                onLike(article.id)
              }}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-500"}`} />
              <span className="text-xs">{article.likes + (isLiked ? 1 : 0)}</span>
            </Button>

            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <MessageCircle className="w-4 h-4 mr-1 text-gray-500" />
              <span className="text-xs">{Math.floor(Math.random() * 100) + 10}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={(e) => {
              e.stopPropagation()
              onShare(article)
            }}
          >
            <Share2 className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})