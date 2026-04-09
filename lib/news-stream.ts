"use client"

import { NewsAPI } from "./news-api"
import type { NewsArticle } from "./news-api"

export default class NewsStreamService {
  private static instance: NewsStreamService
  private newsAPI: NewsAPI
  private subscribers: ((articles: NewsArticle[]) => void)[] = []
  private intervalId: NodeJS.Timeout | null = null
  private isStreaming = false

  private constructor() {
    this.newsAPI = NewsAPI.getInstance()
  }

  static getInstance(): NewsStreamService {
    if (!NewsStreamService.instance) {
      NewsStreamService.instance = new NewsStreamService()
    }
    return NewsStreamService.instance
  }

  startRealTimeStream(callback: (articles: NewsArticle[]) => void): void {
    if (this.isStreaming) {
      this.subscribers.push(callback)
      return
    }

    this.subscribers.push(callback)
    this.isStreaming = true

    // Start the real-time stream from NewsAPI
    this.newsAPI.startRealTimeStream((articles) => {
      this.notifySubscribers(articles)
    })
  }

  stopRealTimeStream(): void {
    this.newsAPI.stopRealTimeStream()
    this.subscribers = []
    this.isStreaming = false
  }

  async refreshStories(): Promise<NewsArticle[]> {
    try {
      const articles = await this.newsAPI.fetchGlobalNews()
      this.notifySubscribers(articles)
      return articles
    } catch (error) {
      console.error("Failed to refresh stories:", error)
      return []
    }
  }

  private notifySubscribers(articles: NewsArticle[]): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(articles)
      } catch (error) {
        console.error("Error notifying subscriber:", error)
      }
    })
  }

  getLatestStories(limit = 20): Promise<NewsArticle[]> {
    return this.newsAPI.fetchGlobalNews().then((articles) => articles.slice(0, limit))
  }

  getTrendingStories(limit = 10): Promise<NewsArticle[]> {
    return this.newsAPI.fetchGlobalNews().then((articles) =>
      articles
        .sort((a, b) => {
          const aScore = a.likes + (a.publishedAt === "Just now" ? 1000 : 0) + (a.isTrending ? 500 : 0)
          const bScore = b.likes + (b.publishedAt === "Just now" ? 1000 : 0) + (b.isTrending ? 500 : 0)
          return bScore - aScore
        })
        .slice(0, limit),
    )
  }

  getStoriesByCategory(category: string, limit?: number): Promise<NewsArticle[]> {
    return this.newsAPI.fetchGlobalNews([category]).then((articles) => (limit ? articles.slice(0, limit) : articles))
  }

  getStoriesByCountry(country: string, limit?: number): Promise<NewsArticle[]> {
    return this.newsAPI.fetchGlobalNews([], [country]).then((articles) => (limit ? articles.slice(0, limit) : articles))
  }

  searchStories(query: string, limit?: number): Promise<NewsArticle[]> {
    return this.newsAPI.fetchGlobalNews().then((articles) => {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(query.toLowerCase()) ||
          article.content.toLowerCase().includes(query.toLowerCase()),
      )
      return limit ? filtered.slice(0, limit) : filtered
    })
  }

  getStreamStats() {
    return {
      isStreaming: this.isStreaming,
      subscriberCount: this.subscribers.length,
    }
  }
}
