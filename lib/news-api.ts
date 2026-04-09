"use client"

interface NewsSource {
  id: string
  name: string
  country: string
  language: string
  category: string
  url: string
  rssUrl?: string
}

export interface NewsArticle {
  id: string
  title: string
  excerpt: string
  content: string
  category: string
  country: string
  image: string
  publishedAt: string
  readTime: string
  likes: number
  isFeatured: boolean
  source: string
  author: string
  url?: string
  isTrending?: boolean
  positivityScore?: number
  exclusionScore?: number
  humanInterestScore?: number
}

class NewsStreamAPI {
  private static instance: NewsStreamAPI
  private apiKey: string = process.env.NEXT_PUBLIC_NEWS_API_KEY || ""
  private baseUrl = "https://newsapi.org/v2"
  private eventSource: EventSource | null = null
  private subscribers: ((articles: NewsArticle[]) => void)[] = []
  private cachedArticles: NewsArticle[] = []
  private lastFetchTime = 0
  private fetchInterval = 300000

  private newsSources: NewsSource[] = [
    { id: "bbc-news", name: "BBC News", country: "UK", language: "en", category: "general", url: "https://www.bbc.com/news" },
    { id: "cnn", name: "CNN", country: "USA", language: "en", category: "general", url: "https://www.cnn.com" },
    { id: "reuters", name: "Reuters", country: "UK", language: "en", category: "general", url: "https://www.reuters.com" },
    { id: "associated-press", name: "Associated Press", country: "USA", language: "en", category: "general", url: "https://apnews.com" },
    { id: "abc-news", name: "ABC News", country: "USA", language: "en", category: "general", url: "https://abcnews.go.com" },
    { id: "cbc-news", name: "CBC News", country: "Canada", language: "en", category: "general", url: "https://www.cbc.ca/news" },
    { id: "the-guardian-uk", name: "The Guardian", country: "UK", language: "en", category: "general", url: "https://www.theguardian.com" },
    { id: "independent", name: "The Independent", country: "UK", language: "en", category: "general", url: "https://www.independent.co.uk" },
    { id: "al-jazeera-english", name: "Al Jazeera English", country: "Qatar", language: "en", category: "general", url: "https://www.aljazeera.com" },
    { id: "france24", name: "France 24", country: "France", language: "en", category: "general", url: "https://www.france24.com/en" },
    { id: "dw", name: "Deutsche Welle", country: "Germany", language: "en", category: "general", url: "https://www.dw.com/en" },
    { id: "xinhua-net", name: "Xinhua", country: "China", language: "en", category: "general", url: "http://www.xinhuanet.com/english" },
    { id: "the-times-of-india", name: "The Times of India", country: "India", language: "en", category: "general", url: "https://timesofindia.indiatimes.com" },
    { id: "japan-today", name: "Japan Today", country: "Japan", language: "en", category: "general", url: "https://japantoday.com" },
    { id: "australian-financial-review", name: "Australian Financial Review", country: "Australia", language: "en", category: "business", url: "https://www.afr.com" },
    { id: "the-jerusalem-post", name: "The Jerusalem Post", country: "Israel", language: "en", category: "general", url: "https://www.jpost.com" },
    { id: "dawn-com", name: "Dawn", country: "Pakistan", language: "en", category: "general", url: "https://www.dawn.com" },
    { id: "the-nation-ng", name: "The Nation Nigeria", country: "Nigeria", language: "en", category: "general", url: "https://thenationonlineng.net" },
    { id: "news24", name: "News24", country: "South Africa", language: "en", category: "general", url: "https://www.news24.com" },
    { id: "straits-times", name: "The Straits Times", country: "Singapore", language: "en", category: "general", url: "https://www.straitstimes.com" },
    { id: "bangkok-post", name: "Bangkok Post", country: "Thailand", language: "en", category: "general", url: "https://www.bangkokpost.com" },
    { id: "manila-bulletin", name: "Manila Bulletin", country: "Philippines", language: "en", category: "general", url: "https://mb.com.ph" },
  ]

  private constructor() {
    this.initializeRealTimeFeeds()
  }

  static getInstance(): NewsStreamAPI {
    if (!NewsStreamAPI.instance) {
      NewsStreamAPI.instance = new NewsStreamAPI()
    }
    return NewsStreamAPI.instance
  }

  private async initializeRealTimeFeeds(): Promise<void> {
    await this.fetchRealNews()

    setInterval(async () => {
      await this.fetchRealNews()
    }, this.fetchInterval)
  }

  async refreshStories(): Promise<NewsArticle[]> {
    this.lastFetchTime = 0
    const articles = await this.fetchGlobalNews()
    this.notifySubscribers(articles)
    return articles
  }

  async fetchGlobalNews(categories: string[] = [], countries: string[] = []): Promise<NewsArticle[]> {
    const now = Date.now()

    if (now - this.lastFetchTime < this.fetchInterval && this.cachedArticles.length > 0) {
      return this.filterAndSortArticles(this.cachedArticles, categories, countries)
    }

    try {
      let allArticles: NewsArticle[] = []

      const gnewsArticles = await this.fetchBroadGNews()
      if (gnewsArticles.length > 0) {
        allArticles = gnewsArticles
      } else {
        const currentsArticles = await this.fetchBroadCurrents()
        if (currentsArticles.length > 0) {
          allArticles = currentsArticles
        } else if (this.apiKey) {
          const newsApiArticles = await this.fetchBroadNewsApi()
          allArticles = newsApiArticles
        }
      }

      const uniqueArticles = this.deduplicateArticles(allArticles)
      const positiveArticles = this.filterPositiveNews(uniqueArticles)

      this.cachedArticles = positiveArticles
      this.lastFetchTime = now

      return this.filterAndSortArticles(positiveArticles, categories, countries)
    } catch (error) {
      console.error("Error fetching global news:", error)
      return []
    }
  }

  private async fetchBroadGNews(): Promise<NewsArticle[]> {
    if (!process.env.NEXT_PUBLIC_GNEWS_API_KEY) return []

    try {
      const apiUrl = `https://gnews.io/api/v4/top-headlines?apikey=${process.env.NEXT_PUBLIC_GNEWS_API_KEY}&lang=en&max=10`
      console.log("Trying broad GNews API:", apiUrl)

      const response = await fetch(apiUrl)
      const data = await response.json()

      console.log("GNews API status:", response.status, data)

      if (!response.ok) return []

      const articles = data.articles || []
      if (!articles.length) return []

      return this.transformBroadArticles(articles)
    } catch (error) {
      console.warn("Broad GNews fetch failed:", error)
      return []
    }
  }

  private async fetchBroadCurrents(): Promise<NewsArticle[]> {
    if (!process.env.NEXT_PUBLIC_CURRENTS_API_KEY) return []

    try {
      const apiUrl = `https://api.currentsapi.services/v1/latest-news?apiKey=${process.env.NEXT_PUBLIC_CURRENTS_API_KEY}&language=en`
      console.log("Trying broad Currents API:", apiUrl)

      const response = await fetch(apiUrl)
      const data = await response.json()

      console.log("Currents API status:", response.status, data)

      if (!response.ok) return []

      const articles = data.news || []
      if (!articles.length) return []

      return this.transformBroadArticles(articles)
    } catch (error) {
      console.warn("Broad Currents fetch failed:", error)
      return []
    }
  }

  private async fetchBroadNewsApi(): Promise<NewsArticle[]> {
    if (!this.apiKey) return []

    try {
      const apiUrl = `${this.baseUrl}/top-headlines?language=en&pageSize=30&apiKey=${this.apiKey}`
      console.log("Trying broad NewsAPI:", apiUrl)

      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "BrightSideNews/1.0",
        },
      })

      const data = await response.json()

      console.log("NewsAPI status:", response.status, data)

      if (!response.ok) return []

      const articles = data.articles || []
      if (!articles.length) return []

      return this.transformBroadArticles(articles)
    } catch (error) {
      console.warn("Broad NewsAPI fetch failed:", error)
      return []
    }
  }

  private async fetchRealNews(): Promise<void> {
    try {
      const articles = await this.fetchGlobalNews()
      this.notifySubscribers(articles)
    } catch (error) {
      console.error("Error in real-time news fetch:", error)
    }
  }

  startRealTimeStream(callback: (articles: NewsArticle[]) => void): void {
    this.subscribers.push(callback)

    if (this.cachedArticles.length > 0) {
      callback(this.cachedArticles)
    } else {
      this.fetchGlobalNews().then((articles) => {
        callback(articles)
      })
    }

    const intervalId = setInterval(async () => {
      try {
        const newArticles = await this.fetchGlobalNews()
        this.notifySubscribers(newArticles)
      } catch (error) {
        console.error("Real-time update failed:", error)
      }
    }, this.fetchInterval)

    if (!this.eventSource) {
      this.eventSource = { close: () => clearInterval(intervalId) } as any
    }
  }

  stopRealTimeStream(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.subscribers = []
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

  private transformBroadArticles(articles: any[]): NewsArticle[] {
    return articles
      .filter((article) => article.title && (article.description || article.content))
      .filter((article) => {
        const text = `${article.title || ""} ${article.description || ""} ${article.content || ""}`
        const asciiChars = text.replace(/[^\x00-\x7F]/g, "").length
        const totalChars = text.length || 1
        const asciiRatio = asciiChars / totalChars
        return asciiRatio >= 0.85
      })
      .map((article, index) => {
        const sourceName =
          article.source?.name ||
          article.source ||
          article.author ||
          "Unknown Source"

        const normalizedText = `${article.title || ""} ${article.description || article.content || ""}`
        const category = this.categorizeArticle(normalizedText)
        const scores = this.scoreArticle(normalizedText)

        return {
          id: `article-${Date.now()}-${index}`,
          title: this.cleanTitle(article.title || ""),
          excerpt: this.cleanText(article.description || article.excerpt || article.content || ""),
          content: this.generateContent(article),
          image: this.validateImageUrl(article.urlToImage || article.image, category),
          category,
          country: this.detectCountry(article),
          source: sourceName,
          author: article.author || sourceName,
          publishedAt: this.formatDate(article.publishedAt || article.published || new Date().toISOString()),
          readTime: this.calculateReadTime(article.content || article.description || ""),
          likes: 0,
          isFeatured: false,
          isTrending: false,
          url: article.url,
          positivityScore: scores.positivityScore,
          exclusionScore: scores.exclusionScore,
          humanInterestScore: scores.humanInterestScore,
        }
      })
  }

  private detectCountry(article: any): string {
    const text = `${article.title || ""} ${article.description || ""} ${article.content || ""}`.toLowerCase()

    const countryRules: Array<[string, string[]]> = [
      ["USA", ["u.s.", "united states", "america", "american", "washington"]],
      ["UK", ["uk", "britain", "british", "england", "london"]],
      ["Canada", ["canada", "canadian"]],
      ["Australia", ["australia", "australian"]],
      ["Germany", ["germany", "german"]],
      ["France", ["france", "french"]],
      ["Japan", ["japan", "japanese"]],
      ["India", ["india", "indian"]],
      ["China", ["china", "chinese"]],
      ["South Africa", ["south africa"]],
      ["Singapore", ["singapore"]],
      ["Qatar", ["qatar"]],
      ["Israel", ["israel"]],
      ["Pakistan", ["pakistan"]],
      ["Nigeria", ["nigeria"]],
      ["Thailand", ["thailand"]],
      ["Philippines", ["philippines"]],
      ["Brazil", ["brazil", "brazilian"]],
      ["Mexico", ["mexico", "mexican"]],
      ["Italy", ["italy", "italian"]],
      ["Spain", ["spain", "spanish"]],
      ["Netherlands", ["netherlands", "dutch"]],
      ["Sweden", ["sweden", "swedish"]],
      ["Norway", ["norway", "norwegian"]],
      ["Turkey", ["turkey", "turkish"]],
      ["South Korea", ["south korea", "korean", "seoul"]],
      ["Russia", ["russia", "russian", "moscow"]],
    ]

    for (const [country, keywords] of countryRules) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return country
      }
    }

    return "USA"
  }

  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>()

    return articles.filter((article) => {
      const key = `${article.title.trim().toLowerCase()}|${article.source.trim().toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\s*-\s*[A-Z][a-z\s.&]+$/, "")
      .replace(/\s*\|\s*[A-Z][a-z\s.&]+$/, "")
      .trim()
  }

  private cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/\[\+?\d+\s*chars?\]/gi, "")
      .replace(/\s+\.\.\.\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  private generateContent(article: any): string {
    const rawContent = this.cleanText(article.content || "")
    const rawDescription = this.cleanText(article.description || "")

    const contentLooksTruncated =
      /\[\+?\d+\s*chars?\]/i.test(article.content || "") ||
      /\.\.\./.test(article.content || "")

    if (!rawContent && rawDescription) return rawDescription
    if (contentLooksTruncated) return rawDescription || rawContent

    return rawContent || rawDescription
  }

  private validateImageUrl(url: string, category?: string): string {
    if (!url || url.includes("placeholder") || url.includes("default")) {
      return this.getCategoryImage(category)
    }

    try {
      new URL(url)
      return url
    } catch {
      return this.getCategoryImage(category)
    }
  }

  private categorizeArticle(text: string): string {
    const categories = {
      "Health & Wellbeing": [
        "health",
        "medical",
        "cure",
        "therapy",
        "wellness",
        "fitness",
        "mental health",
        "hospital",
        "doctor",
        "treatment",
      ],
      "Science & Breakthroughs": [
        "science",
        "research",
        "discovery",
        "breakthrough",
        "innovation",
        "technology",
        "study",
        "scientist",
        "laboratory",
      ],
      "Community & Kindness": [
        "community",
        "volunteer",
        "charity",
        "help",
        "support",
        "kindness",
        "donation",
        "neighbor",
        "local",
        "together",
      ],
      Children: ["child", "children", "student", "school", "education", "young", "kid", "youth", "teenager", "family"],
      "Animals & Wildlife": [
        "animal",
        "wildlife",
        "pet",
        "rescue",
        "conservation",
        "species",
        "nature",
        "zoo",
        "veterinary",
        "habitat",
      ],
      "Arts & Culture": [
        "art",
        "music",
        "culture",
        "exhibition",
        "performance",
        "artist",
        "creative",
        "museum",
        "theater",
        "festival",
      ],
      Environment: [
        "environment",
        "green",
        "sustainability",
        "conservation",
        "climate",
        "renewable",
        "energy",
        "pollution",
        "recycling",
        "decarbonization",
        "emissions",
        "esg",
      ],
      "Inspirational Stories": [
        "inspiring",
        "hero",
        "overcome",
        "triumph",
        "achievement",
        "success",
        "remarkable",
        "extraordinary",
        "miracle",
      ],
      Technology: [
        "tech",
        "digital",
        "app",
        "software",
        "internet",
        "computer",
        "ai",
        "robot",
        "innovation",
        "startup",
        "chip",
        "processor",
        "intel",
      ],
      "Sports & Wellness": [
        "sport",
        "athlete",
        "fitness",
        "exercise",
        "marathon",
        "competition",
        "team",
        "championship",
        "training",
      ],
      "Good Business": [
        "business",
        "company",
        "entrepreneur",
        "startup",
        "job",
        "employment",
        "economy",
        "investment",
        "growth",
      ],
      "Everyday Heroes": [
        "hero",
        "volunteer",
        "helper",
        "rescue",
        "save",
        "protect",
        "serve",
        "first responder",
        "firefighter",
      ],
      "Social Impact": [
        "social",
        "impact",
        "change",
        "movement",
        "activism",
        "rights",
        "equality",
        "justice",
        "inclusion",
      ],
      "Uplifting World": [
        "world",
        "global",
        "international",
        "peace",
        "unity",
        "cooperation",
        "together",
        "humanity",
        "universal",
      ],
    }

    const lowerText = text.toLowerCase()

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        return category
      }
    }

    return "Inspirational Stories"
  }

  private getCategoryImage(category?: string): string {
    const categoryImages: Record<string, string> = {
      "Health & Wellbeing":
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&auto=format&q=80",
      "Science & Breakthroughs":
        "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=400&h=250&fit=crop&auto=format&q=80",
      "Community & Kindness":
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=250&fit=crop&auto=format&q=80",
      Environment:
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop&auto=format&q=80",
      Technology:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop&auto=format&q=80",
      "Arts & Culture":
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=250&fit=crop&auto=format&q=80",
      "Animals & Wildlife":
        "https://images.unsplash.com/photo-1501706362039-c6e80948bb85?w=400&h=250&fit=crop&auto=format&q=80",
      "Inspirational Stories":
        "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=250&fit=crop&auto=format&q=80",
      "Good Business":
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=400&h=250&fit=crop&auto=format&q=80",
      "Social Impact":
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=250&fit=crop&auto=format&q=80",
      Children:
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=250&fit=crop&auto=format&q=80",
      "Everyday Heroes":
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=250&fit=crop&auto=format&q=80",
      "Sports & Wellness":
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=250&fit=crop&auto=format&q=80",
      "Uplifting World":
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400&h=250&fit=crop&auto=format&q=80",
    }

    return (
      categoryImages[category || ""] ||
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&h=250&fit=crop&auto=format&q=80"
    )
  }

  private scoreArticle(text: string): {
    positivityScore: number
    exclusionScore: number
    humanInterestScore: number
  } {
    const lowerText = text.toLowerCase()

    const positiveSignals: Array<[string, number]> = [
      ["community", 2],
      ["kindness", 3],
      ["volunteer", 2],
      ["charity", 2],
      ["donation", 1],
      ["support", 1],
      ["help", 1],
      ["teacher", 2],
      ["student", 2],
      ["school", 1],
      ["family", 1],
      ["child", 1],
      ["children", 1],
      ["health", 1],
      ["wellness", 2],
      ["recovery", 2],
      ["healing", 2],
      ["rescue", 3],
      ["rescued", 3],
      ["wildlife", 2],
      ["conservation", 2],
      ["nature", 1],
      ["renewable", 2],
      ["clean energy", 2],
      ["breakthrough", 3],
      ["innovation", 2],
      ["research", 1],
      ["progress", 2],
      ["improvement", 2],
      ["solution", 2],
      ["hope", 2],
      ["hopeful", 2],
      ["inspiring", 3],
      ["uplifting", 3],
      ["celebration", 2],
      ["achievement", 2],
      ["success", 2],
      ["arts", 1],
      ["music", 1],
      ["culture", 1],
      ["festival", 1],
      ["local", 1],
      ["together", 1],
      ["creative", 1],
      ["fundraiser", 2],
      ["mentor", 2],
      ["scholarship", 2],
    ]

    const humanSignals: Array<[string, number]> = [
      ["community", 2],
      ["volunteer", 2],
      ["family", 1],
      ["teacher", 2],
      ["student", 2],
      ["school", 1],
      ["child", 1],
      ["children", 1],
      ["neighbour", 1],
      ["neighbor", 1],
      ["charity", 2],
      ["fundraiser", 2],
      ["rescue", 2],
      ["rescued", 2],
      ["local", 1],
      ["hospital", 1],
      ["doctor", 1],
      ["nurse", 1],
      ["community center", 2],
      ["care home", 2],
    ]

    const softNegativeSignals: Array<[string, number]> = [
      ["protest", 3],
      ["walkout", 4],
      ["strike", 4],
      ["court", 4],
      ["lawsuit", 5],
      ["legal", 3],
      ["crime", 4],
      ["arrest", 4],
      ["charged", 5],
      ["prison", 4],
      ["jail", 4],
      ["investor", 5],
      ["shares", 5],
      ["earnings", 5],
      ["stocks", 5],
      ["stock", 4],
      ["markets", 3],
      ["politics", 5],
      ["political", 5],
      ["government", 3],
      ["minister", 4],
      ["election", 5],
      ["party", 3],
      ["parliament", 4],
      ["senate", 4],
      ["congress", 4],
      ["conflict", 3],
    ]

    let positivityScore = 0
    let exclusionScore = 0
    let humanInterestScore = 0

    for (const [keyword, weight] of positiveSignals) {
      if (lowerText.includes(keyword)) positivityScore += weight
    }

    for (const [keyword, weight] of humanSignals) {
      if (lowerText.includes(keyword)) humanInterestScore += weight
    }

    for (const [keyword, weight] of softNegativeSignals) {
      if (lowerText.includes(keyword)) exclusionScore += weight
    }

    return {
      positivityScore,
      exclusionScore,
      humanInterestScore,
    }
  }

  private hasHardExclusion(text: string): boolean {
    const lowerText = text.toLowerCase()

    const hardNegativePhrases = [
      "war",
      "attack",
      "attacks",
      "missile",
      "airstrike",
      "bomb",
      "explosion",
      "shooting",
      "terror",
      "terrorism",
      "military",
      "troops",
      "invasion",
      "killed",
      "killed in",
      "dead",
      "death toll",
      "murder",
      "massacre",
      "hostage",
      "rape",
      "sexual assault",
      "fraud",
      "class action",
      "shareholder alert",
      "investor alert",
      "earnings call",
      "poll results",
      "election results",
      "prime minister",
      "president said",
      "government collapse",
      "police appeal",
      "wanted by police",
    ]

    const badSourceKeywords = [
      "law firm",
      "investor alert",
      "shareholder alert",
      "class action",
      "deadline reminder",
      "fraud investigation",
      "marketscreener",
      "globenewswire",
      "pr newswire",
      "benzinga",
      "seeking alpha",
    ]

    return (
      hardNegativePhrases.some((keyword) => lowerText.includes(keyword)) ||
      badSourceKeywords.some((keyword) => lowerText.includes(keyword))
    )
  }

  private filterPositiveNews(articles: NewsArticle[]): NewsArticle[] {
    if (!articles.length) return []

    const asciiSafe = articles.filter((article) => {
      const text = `${article.title} ${article.excerpt} ${article.content} ${article.source} ${article.author}`.toLowerCase()
      const asciiChars = text.replace(/[^\x00-\x7F]/g, "").length
      const totalChars = text.length || 1
      const asciiRatio = asciiChars / totalChars
      return asciiRatio >= 0.85
    })

    const noHardExclusions = asciiSafe.filter((article) => {
      const text = `${article.title} ${article.excerpt} ${article.content} ${article.source} ${article.author}`.toLowerCase()
      return !this.hasHardExclusion(text)
    })

    console.log("BrightSide feed stats", {
      total: articles.length,
      asciiSafe: asciiSafe.length,
      noHardExclusions: noHardExclusions.length,
    })

    const strict = noHardExclusions.filter((article) => {
      const positivityScore = article.positivityScore ?? 0
      const exclusionScore = article.exclusionScore ?? 0
      const humanInterestScore = article.humanInterestScore ?? 0
      const combinedPositiveScore = positivityScore + humanInterestScore

      return combinedPositiveScore >= 3 && exclusionScore <= 3
    })

    if (strict.length >= 8) {
      console.log("BrightSide using strict filter", strict.length)
      return strict
    }

    const relaxed = noHardExclusions.filter((article) => {
      const positivityScore = article.positivityScore ?? 0
      const exclusionScore = article.exclusionScore ?? 0
      const humanInterestScore = article.humanInterestScore ?? 0
      const combinedPositiveScore = positivityScore + humanInterestScore

      if (combinedPositiveScore >= 2 && exclusionScore <= 4) return true
      if (combinedPositiveScore >= 1 && exclusionScore <= 1) return true

      const safeCategories = new Set([
        "Health & Wellbeing",
        "Science & Breakthroughs",
        "Community & Kindness",
        "Animals & Wildlife",
        "Arts & Culture",
        "Environment",
        "Inspirational Stories",
        "Social Impact",
        "Uplifting World",
        "Everyday Heroes",
        "Children",
        "Sports & Wellness",
        "Technology",
      ])

      return safeCategories.has(article.category) && exclusionScore === 0
    })

    if (relaxed.length >= 5) {
      console.log("BrightSide using relaxed filter", relaxed.length)
      return relaxed
    }

    const fallback = [...noHardExclusions]
      .sort((a, b) => {
        const scoreA = (a.positivityScore || 0) + (a.humanInterestScore || 0) - (a.exclusionScore || 0)
        const scoreB = (b.positivityScore || 0) + (b.humanInterestScore || 0) - (b.exclusionScore || 0)
        return scoreB - scoreA
      })
      .slice(0, Math.min(12, noHardExclusions.length))

    console.log("BrightSide using fallback filter", fallback.length)
    return fallback
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInHours < 48) return "Yesterday"
    return date.toLocaleDateString()
  }

  private calculateReadTime(content: string): string {
    const wordsPerMinute = 200
    const wordCount = content.split(" ").filter(Boolean).length
    const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute))
    return `${minutes} min read`
  }

  private filterAndSortArticles(articles: NewsArticle[], categories: string[], countries: string[]): NewsArticle[] {
    let filtered = articles

    if (categories.length > 0) {
      filtered = filtered.filter((article) => categories.includes(article.category))
    }

    if (countries.length > 0) {
      filtered = filtered.filter((article) => countries.includes(article.country))
    }

    return this.sortByFitAndRecency(filtered)
  }

  private sortByFitAndRecency(articles: NewsArticle[]): NewsArticle[] {
    return [...articles].sort((a, b) => {
      const scoreA = (a.positivityScore || 0) + (a.humanInterestScore || 0) - (a.exclusionScore || 0)
      const scoreB = (b.positivityScore || 0) + (b.humanInterestScore || 0) - (b.exclusionScore || 0)

      if (scoreB !== scoreA) return scoreB - scoreA

      if (a.publishedAt === "Just now" && b.publishedAt !== "Just now") return -1
      if (b.publishedAt === "Just now" && a.publishedAt !== "Just now") return 1

      const dateA = new Date(a.publishedAt === "Just now" ? new Date() : a.publishedAt)
      const dateB = new Date(b.publishedAt === "Just now" ? new Date() : b.publishedAt)
      return dateB.getTime() - dateA.getTime()
    })
  }

  getAvailableCountries(): string[] {
    return [...new Set(this.newsSources.map((source) => source.country))].sort()
  }

  getAvailableSources(): NewsSource[] {
    return this.newsSources
  }
}

export const NewsAPI = NewsStreamAPI
export type { NewsSource }
