"use client"

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export interface BookmarkedStory {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  source: string
  author: string
  likes: number
  savedAt: string
  folderId?: string
}

export interface BookmarkFolder {
  id: string
  name: string
  color: string
}

export interface ReadingHistoryItem {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  source: string
  author: string
  readAt: string
  readingTime: number // in seconds
  liked: boolean
}

export interface CommentInteraction {
  id: string
  articleId: string
  articleTitle: string
  category: string
  content: string
  createdAt: string
  likes?: number
  replies?: number
}

export interface LikeInteraction {
  id: string
  articleId: string
  articleTitle: string
  category: string
  image: string
  likedAt: string
}

export interface ShareInteraction {
  id: string
  articleId: string
  articleTitle: string
  category: string
  image: string
  platform: string
  sharedAt: string
}

export interface UserInteractions {
  comments: CommentInteraction[]
  likes: LikeInteraction[]
  shares: ShareInteraction[]
}

export interface MoodEntry {
  id: string
  date: string
  beforeReading: number // 1-5 scale
  afterReading: number // 1-5 scale
  improvement: number // calculated difference
  notes?: string
}

export interface FeedSettings {
  categories: Record<string, boolean>
  preferences: {
    positivityLevel: number[]
    updateFrequency: string
    showImages: boolean
    autoRefresh: boolean
    notifications: boolean
    emailDigest: boolean
  }
  countries: Record<string, boolean>
}

export interface DisplaySettings {
  theme: string
  fontSize: number[]
  fontFamily: string
  reducedMotion: boolean
  highContrast: boolean
  autoPlayVideos: boolean
  soundEffects: boolean
  notifications: boolean
  compactMode: boolean
  showImages: boolean
  colorScheme: string
}

export interface UserData {
  profile: UserProfile
  bookmarks: BookmarkedStory[]
  bookmarkFolders: BookmarkFolder[]
  readingHistory: ReadingHistoryItem[]
  interactions: UserInteractions
  moodEntries: MoodEntry[]
  feedSettings?: FeedSettings
  displaySettings?: DisplaySettings
}

// Default user data
const createDefaultUserData = (): UserData => ({
  profile: {
    id: "user-1",
    name: "BrightSide Reader",
    email: "reader@brightsidenews.com",
    avatar: "",
    bio: "Spreading positivity one story at a time! 🌟",
    location: "Worldwide",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  bookmarks: [
    {
      id: "bookmark-1",
      title: "Community Comes Together to Build Playground for Children with Disabilities",
      excerpt: "Local residents unite to create an inclusive space where all children can play together safely.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&auto=format&q=80",
      category: "Community & Kindness",
      source: "Good News Network",
      author: "Sarah Johnson",
      likes: 234,
      savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      folderId: "kindness",
    },
    {
      id: "bookmark-2",
      title: "Scientists Develop Revolutionary Water Purification Technology",
      excerpt: "New breakthrough could provide clean drinking water to millions in developing countries.",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&h=250&fit=crop&auto=format&q=80",
      category: "Science & Breakthroughs",
      source: "Science Daily",
      author: "Dr. Michael Chen",
      likes: 456,
      savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      folderId: "default",
    },
    {
      id: "bookmark-3",
      title: "Teenager Invents Device to Help Elderly Stay Connected",
      excerpt: "16-year-old creates simple technology solution to combat loneliness among seniors.",
      image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=250&fit=crop&auto=format&q=80",
      category: "Inspirational Stories",
      source: "Youth Innovation",
      author: "Emma Rodriguez",
      likes: 189,
      savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      folderId: "inspiring",
    },
  ],
  bookmarkFolders: [
    { id: "default", name: "All Bookmarks", color: "blue" },
    { id: "inspiring", name: "Inspiring People", color: "purple" },
    { id: "kindness", name: "Acts of Kindness", color: "pink" },
    { id: "environment", name: "Environmental Wins", color: "green" },
    { id: "animals", name: "Animal Stories", color: "orange" },
  ],
  readingHistory: [
    {
      id: "history-1",
      title: "Local Chef Provides Free Meals to Healthcare Workers",
      excerpt: "Restaurant owner shows appreciation for frontline workers with daily meal service.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop&auto=format&q=80",
      category: "Community & Kindness",
      source: "Local News",
      author: "Maria Garcia",
      readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      readingTime: 180, // 3 minutes
      liked: true,
    },
    {
      id: "history-2",
      title: "Students Launch Campaign to Plant Native Flowers",
      excerpt: "High school environmental club creates butterfly gardens throughout the city.",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=250&fit=crop&auto=format&q=80",
      category: "Environment",
      source: "Green Today",
      author: "Alex Thompson",
      readAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      readingTime: 240, // 4 minutes
      liked: false,
    },
    {
      id: "history-3",
      title: "Animal Shelter Finds Homes for 500 Pets This Month",
      excerpt: "Record-breaking adoption event brings joy to hundreds of families and their new pets.",
      image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=250&fit=crop&auto=format&q=80",
      category: "Animals & Wildlife",
      source: "Pet Rescue News",
      author: "Jennifer Lee",
      readAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      readingTime: 150, // 2.5 minutes
      liked: true,
    },
  ],
  interactions: {
    comments: [
      {
        id: "comment-1",
        articleId: "article-1",
        articleTitle: "Community Comes Together to Build Playground for Children with Disabilities",
        category: "Community & Kindness",
        content:
          "This is absolutely wonderful! It's amazing to see communities coming together for such an important cause. Every child deserves a safe place to play and feel included. 💙",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        replies: 3,
      },
      {
        id: "comment-2",
        articleId: "article-2",
        articleTitle: "Scientists Develop Revolutionary Water Purification Technology",
        category: "Science & Breakthroughs",
        content:
          "This could be a game-changer for so many communities around the world. Science at its best - solving real problems and improving lives! 🌍",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        replies: 1,
      },
    ],
    likes: [
      {
        id: "like-1",
        articleId: "article-1",
        articleTitle: "Community Comes Together to Build Playground for Children with Disabilities",
        category: "Community & Kindness",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&auto=format&q=80",
        likedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "like-2",
        articleId: "article-3",
        articleTitle: "Animal Shelter Finds Homes for 500 Pets This Month",
        category: "Animals & Wildlife",
        image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=250&fit=crop&auto=format&q=80",
        likedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ],
    shares: [
      {
        id: "share-1",
        articleId: "article-1",
        articleTitle: "Community Comes Together to Build Playground for Children with Disabilities",
        category: "Community & Kindness",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&auto=format&q=80",
        platform: "Twitter",
        sharedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  moodEntries: [
    {
      id: "mood-1",
      date: new Date().toISOString(),
      beforeReading: 3,
      afterReading: 4,
      improvement: 1,
      notes: "The story about the community playground really lifted my spirits today!",
    },
    {
      id: "mood-2",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      beforeReading: 2,
      afterReading: 4,
      improvement: 2,
      notes: "Reading about scientific breakthroughs always makes me feel hopeful about the future.",
    },
    {
      id: "mood-3",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      beforeReading: 3,
      afterReading: 5,
      improvement: 2,
      notes: "Animal rescue stories are my favorite - they always make me smile!",
    },
  ],
})

// Storage key
const STORAGE_KEY = "brightside-user-data"

// Get user data from localStorage
export function getUserData(): UserData {
  if (typeof window === "undefined") {
    return createDefaultUserData()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Merge with default data to ensure all fields exist
      return { ...createDefaultUserData(), ...parsed }
    }
  } catch (error) {
    console.error("Failed to load user data:", error)
  }

  const defaultData = createDefaultUserData()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData))
  return defaultData
}

// Update user data in localStorage
export function updateUserData(userData: UserData): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
  } catch (error) {
    console.error("Failed to save user data:", error)
  }
}

// Delete all user data
export function deleteUserData(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem("brightside-theme")
    localStorage.removeItem("brightside-display-settings")
    localStorage.removeItem("brightside-categories")
  } catch (error) {
    console.error("Failed to delete user data:", error)
  }
}

// Export user data as JSON
export function exportUserData(): void {
  if (typeof window === "undefined") return

  try {
    const userData = getUserData()
    const dataStr = JSON.stringify(userData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })

    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `brightside-user-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Failed to export user data:", error)
  }
}

// Add bookmark
export function addBookmark(story: Omit<BookmarkedStory, "id" | "savedAt">): void {
  const userData = getUserData()
  const bookmark: BookmarkedStory = {
    ...story,
    id: `bookmark-${Date.now()}`,
    savedAt: new Date().toISOString(),
  }

  userData.bookmarks.unshift(bookmark)
  updateUserData(userData)
}

// Remove bookmark
export function removeBookmark(bookmarkId: string): void {
  const userData = getUserData()
  userData.bookmarks = userData.bookmarks.filter((b) => b.id !== bookmarkId)
  updateUserData(userData)
}

// Add reading history entry
export function addReadingHistoryEntry(entry: Omit<ReadingHistoryItem, "id" | "readAt">): void {
  const userData = getUserData()
  const historyItem: ReadingHistoryItem = {
    ...entry,
    id: `history-${Date.now()}`,
    readAt: new Date().toISOString(),
  }

  userData.readingHistory.unshift(historyItem)
  updateUserData(userData)
}

// Add mood entry
export function addMoodEntry(entry: Omit<MoodEntry, "id" | "date" | "improvement">): void {
  const userData = getUserData()
  const moodEntry: MoodEntry = {
    ...entry,
    id: `mood-${Date.now()}`,
    date: new Date().toISOString(),
    improvement: entry.afterReading - entry.beforeReading,
  }

  userData.moodEntries.unshift(moodEntry)
  updateUserData(userData)
}
