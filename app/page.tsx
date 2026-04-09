"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DonationModal } from "@/components/donation-modal"
import { NewsCard } from "@/components/news-card"
import { categoryGroups, getCategoryGroup } from "@/lib/categories"
import NewsStreamService from "@/lib/news-stream"
import type { NewsArticle } from "@/lib/news-api"
import {
  Menu,
  X,
  Search,
  Heart,
  Share2,
  MessageCircle,
  Home,
  Settings,
  Globe,
  Clock,
  MapPin,
  Star,
  Filter,
  RefreshCw,
  ChevronDown,
  Loader2,
  Gift,
  Code,
  Smartphone,
  ExternalLink,
  Rss,
  Zap,
} from "lucide-react"
import { FeaturedCarousel } from "@/components/featured-carousel"
import { FeaturedCategoriesService } from "@/components/admin-featured-categories"
import { UserMenu } from "@/components/auth/user-menu"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const ITEMS_PER_PAGE = 12

export default function BrightSideNews() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCountry, setSelectedCountry] = useState("All Countries")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set())
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set())
  const [news, setNews] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [featuredCategories, setFeaturedCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLiveStreaming, setIsLiveStreaming] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  useEffect(() => {
    const newsStreamService = NewsStreamService.getInstance()

    setIsLoading(true)
    setIsLiveStreaming(true)

    newsStreamService.startRealTimeStream((articles) => {
      setNews(articles)
      setIsLoading(false)
      setLastUpdateTime(new Date())
    })

    return () => {
      newsStreamService.stopRealTimeStream()
      setIsLiveStreaming(false)
    }
  }, [])

  useEffect(() => {
    const service = FeaturedCategoriesService.getInstance()
    setFeaturedCategories(service.getFeaturedCategories())
  }, [])

  const availableCountries = useMemo(() => {
    const uniqueCountries = Array.from(
      new Set(news.map((article) => article.country).filter(Boolean))
    ).sort()

    return ["All Countries", ...uniqueCountries]
  }, [news])

  const filteredNews = useMemo(() => {
    return news.filter((article) => {
      const matchesCategory = selectedCategory === "All" || article.category === selectedCategory
      const matchesCountry = selectedCountry === "All Countries" || article.country === selectedCountry
      const matchesSearch =
        debouncedSearchQuery === "" ||
        article.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(debouncedSearchQuery.toLowerCase())

      return matchesCategory && matchesCountry && matchesSearch
    })
  }, [news, selectedCategory, selectedCountry, debouncedSearchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedCountry, debouncedSearchQuery])

  const paginatedNews = useMemo(() => {
    const endIndex = currentPage * ITEMS_PER_PAGE
    return filteredNews.slice(0, endIndex)
  }, [filteredNews, currentPage])

  const totalPages = Math.ceil(filteredNews.length / ITEMS_PER_PAGE)
  const hasMoreItems = currentPage < totalPages

  const normalizedSelectedContent = useMemo(() => {
    if (!selectedArticle?.content) return ""

    return selectedArticle.content
      .replace(/\[\+?\d+\s*chars?\]/gi, "")
      .replace(/\s+\.\.\.\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }, [selectedArticle])

  const normalizedSelectedExcerpt = useMemo(() => {
    if (!selectedArticle?.excerpt) return ""

    return selectedArticle.excerpt
      .replace(/\s+/g, " ")
      .trim()
  }, [selectedArticle])

  const shouldShowFullContent = useMemo(() => {
    if (!normalizedSelectedContent) return false
    if (!normalizedSelectedExcerpt) return true

    return normalizedSelectedContent.toLowerCase() !== normalizedSelectedExcerpt.toLowerCase()
  }, [normalizedSelectedContent, normalizedSelectedExcerpt])

  const handleLike = useCallback((articleId: string) => {
    setLikedArticles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }, [])

  const handleBookmark = useCallback((articleId: string) => {
    setBookmarkedArticles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }, [])

  const handleShare = useCallback((article: NewsArticle) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt,
        url: article.url || window.location.href,
      })
    } else {
      navigator.clipboard.writeText(`${article.title} - ${article.url || window.location.href}`)
      alert("Link copied to clipboard!")
    }
  }, [])

  const openArticle = useCallback((article: NewsArticle) => {
    setSelectedArticle(article)
  }, [])

  const closeArticle = useCallback(() => {
    setSelectedArticle(null)
  }, [])

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    const newsStreamService = NewsStreamService.getInstance()
    try {
      const refreshedArticles = await newsStreamService.refreshStories()
      setNews(refreshedArticles)
      setLastUpdateTime(new Date())
    } catch (error) {
      console.error("Failed to refresh:", error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const loadMoreItems = useCallback(() => {
    if (hasMoreItems) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [hasMoreItems])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Rss className="w-8 h-8 animate-pulse text-sky-600 mr-2" />
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading live positive news...</p>
          <p className="text-gray-500 text-sm mt-2">Connecting to global news sources</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <header className="bg-white/95 backdrop-blur-sm border-b border-sky-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">BrightSide News</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    {isLiveStreaming ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-red-600 font-medium">LIVE</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Connected</span>
                      </>
                    )}
                    <span>• {news.length} stories</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" className="text-gray-700 hover:text-sky-600">
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-sky-600"
                onClick={() => setIsDonationModalOpen(true)}
              >
                <Heart className="w-4 h-4 mr-2" />
                Donate
              </Button>
              <UserMenu />
              <Button
                variant="ghost"
                className="text-gray-700 hover:text-sky-600"
                onClick={() => (window.location.href = "/admin")}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </nav>

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-sky-200">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-gray-700">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700"
                  onClick={() => setIsDonationModalOpen(true)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donate
                </Button>
                <div className="px-4 py-2">
                  <UserMenu />
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-700"
                  onClick={() => (window.location.href = "/admin")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="bg-gradient-to-r from-red-600 to-pink-700 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold text-sm">LIVE NEWS</span>
              </div>
              <span className="text-red-100 text-sm">
                Real-time positive stories from {availableCountries.length - 1} countries
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-red-100">
              <Clock className="w-4 h-4" />
              <span>Last update: {lastUpdateTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-sky-600 to-blue-700 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Support BrightSide News Development</h3>
                <p className="text-sky-100">
                  Your donations help us continue developing this app and bringing positive news to the world
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-sky-100">
                <Code className="w-4 h-4" />
                <span>App Development</span>
                <span>•</span>
                <Smartphone className="w-4 h-4" />
                <span>New Features</span>
                <span>•</span>
                <Globe className="w-4 h-4" />
                <span>Global Expansion</span>
              </div>
              <Button
                onClick={() => setIsDonationModalOpen(true)}
                className="bg-white text-sky-600 hover:bg-sky-50 font-semibold px-6 py-2"
              >
                <Heart className="w-4 h-4 mr-2" />
                Donate Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Live <span className="text-sky-600">Positive News</span> Stream
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real-time uplifting stories from trusted news sources worldwide. No fear, no negativity—just feel-good
              news to brighten your day.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Real-time Updates</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                <span>{availableCountries.length - 1} Countries</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{filteredNews.length} Stories Available</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <FeaturedCarousel
              news={news}
              featuredCategories={featuredCategories}
              onArticleClick={openArticle}
              onLike={handleLike}
              onShare={handleShare}
              likedArticles={likedArticles}
            />
          </div>
        </section>

        <section className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search live positive news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-sky-200 focus:border-sky-400"
              />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <Filter className="w-4 h-4 text-gray-500 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-sky-200 rounded-md focus:outline-none focus:border-sky-400 min-w-0 flex-1 lg:w-auto"
              >
                <option value="All">All Categories</option>
                {categoryGroups.map((group) => (
                  <optgroup key={group.name} label={`── ${group.name} ──`}>
                    {group.categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-gray-500 shrink-0" />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 border border-sky-200 rounded-md focus:outline-none focus:border-sky-400 min-w-0 flex-1 lg:w-auto"
              >
                {availableCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="border-sky-200 text-sky-600 hover:bg-sky-50 bg-transparent shrink-0"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-sky-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-sky-600">{news.length}</div>
                <div className="text-sm text-gray-600">Live Stories</div>
              </CardContent>
            </Card>
            <Card className="border-sky-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{filteredNews.length}</div>
                <div className="text-sm text-gray-600">Filtered Results</div>
              </CardContent>
            </Card>
            <Card className="border-sky-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{availableCountries.length - 1}</div>
                <div className="text-sm text-gray-600">Countries</div>
              </CardContent>
            </Card>
            <Card className="border-sky-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{featuredCategories.length}</div>
                <div className="text-sm text-gray-600">Featured Categories</div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedNews.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onArticleClick={openArticle}
                onLike={handleLike}
                onShare={handleShare}
                onBookmark={handleBookmark}
                isLiked={likedArticles.has(article.id)}
                isBookmarked={bookmarkedArticles.has(article.id)}
              />
            ))}
          </div>

          {hasMoreItems && (
            <div className="text-center mt-8">
              <Button onClick={loadMoreItems} className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3">
                Load More Stories
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Showing {paginatedNews.length} of {filteredNews.length} stories
              </p>
            </div>
          )}

          {filteredNews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No live stories found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find more uplifting stories.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                  setSelectedCountry("All Countries")
                }}
                className="bg-sky-600 hover:bg-sky-700"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </section>
      </main>

      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedArticle.image || "/placeholder.svg"}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src =
                    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=250&fit=crop&auto=format&q=80"
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={closeArticle}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className="border-sky-200 text-sky-700">
                  {selectedArticle.category}
                </Badge>
                <Badge variant="outline" className="border-gray-200 text-gray-600">
                  {getCategoryGroup(selectedArticle.category)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedArticle.country}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{selectedArticle.readTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <ExternalLink className="w-4 h-4" />
                <span>
                  <strong>Source:</strong> {selectedArticle.source} • <strong>Author:</strong> {selectedArticle.author}
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                {selectedArticle.title}
              </h1>

              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {selectedArticle.excerpt}
              </p>

              {shouldShowFullContent && (
                <div className="prose max-w-none">
                  {normalizedSelectedContent
                    .split("\n")
                    .map((paragraph) => paragraph.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={index} className="text-gray-700 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-gray-200 gap-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleLike(selectedArticle.id)}
                    className="flex items-center gap-2"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        likedArticles.has(selectedArticle.id) ? "fill-red-500 text-red-500" : "text-gray-500"
                      }`}
                    />
                    <span>{selectedArticle.likes + (likedArticles.has(selectedArticle.id) ? 1 : 0)} likes</span>
                  </Button>

                  <Button variant="ghost" className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                    <span>{Math.floor(Math.random() * 100) + 10} comments</span>
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  {selectedArticle.url && (
                    <Button variant="outline" asChild className="flex items-center gap-2">
                      <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Read Original
                      </a>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleShare(selectedArticle)}
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Story
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <DonationModal isOpen={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} />
    </div>
  )
}