"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { type UserData, getUserData } from "@/lib/user-data"
import { Trophy, Star, Crown, Lock, Book, Heart } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  tier: "bronze" | "silver" | "gold" | "platinum"
  category: "reading" | "engagement" | "positivity" | "community" | "special"
  requirement: number
  current: number
  unlocked: boolean
  unlockedAt?: string
}

export function UserAchievements() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    const data = getUserData()
    setUserData(data)

    if (data) {
      const userAchievements = calculateAchievements(data)
      setAchievements(userAchievements)
    }
  }, [])

  const calculateAchievements = (data: UserData): Achievement[] => {
    const storiesRead = data.readingHistory.length
    const bookmarksCount = data.bookmarks.length
    const commentsCount = data.interactions.comments.length
    const likesCount = data.interactions.likes.length
    const moodEntries = data.moodEntries.length
    const positiveImpact = data.moodEntries.filter((entry) => entry.improvement > 0).length

    return [
      // Reading Achievements
      {
        id: "first-story",
        title: "First Steps",
        description: "Read your first positive story",
        icon: "📖",
        tier: "bronze",
        category: "reading",
        requirement: 1,
        current: storiesRead,
        unlocked: storiesRead >= 1,
        unlockedAt: storiesRead >= 1 ? data.readingHistory[0]?.readAt : undefined,
      },
      {
        id: "story-explorer",
        title: "Story Explorer",
        description: "Read 10 uplifting stories",
        icon: "🌟",
        tier: "silver",
        category: "reading",
        requirement: 10,
        current: storiesRead,
        unlocked: storiesRead >= 10,
      },
      {
        id: "news-enthusiast",
        title: "News Enthusiast",
        description: "Read 50 positive stories",
        icon: "📚",
        tier: "gold",
        category: "reading",
        requirement: 50,
        current: storiesRead,
        unlocked: storiesRead >= 50,
      },
      {
        id: "positivity-champion",
        title: "Positivity Champion",
        description: "Read 100 uplifting stories",
        icon: "👑",
        tier: "platinum",
        category: "reading",
        requirement: 100,
        current: storiesRead,
        unlocked: storiesRead >= 100,
      },

      // Engagement Achievements
      {
        id: "first-bookmark",
        title: "Keeper of Stories",
        description: "Save your first story",
        icon: "🔖",
        tier: "bronze",
        category: "engagement",
        requirement: 1,
        current: bookmarksCount,
        unlocked: bookmarksCount >= 1,
      },
      {
        id: "curator",
        title: "Story Curator",
        description: "Save 25 inspiring stories",
        icon: "📝",
        tier: "silver",
        category: "engagement",
        requirement: 25,
        current: bookmarksCount,
        unlocked: bookmarksCount >= 25,
      },
      {
        id: "first-comment",
        title: "Voice of Positivity",
        description: "Leave your first comment",
        icon: "💬",
        tier: "bronze",
        category: "engagement",
        requirement: 1,
        current: commentsCount,
        unlocked: commentsCount >= 1,
      },
      {
        id: "conversation-starter",
        title: "Conversation Starter",
        description: "Leave 10 thoughtful comments",
        icon: "🗣️",
        tier: "silver",
        category: "engagement",
        requirement: 10,
        current: commentsCount,
        unlocked: commentsCount >= 10,
      },

      // Positivity Achievements
      {
        id: "mood-tracker",
        title: "Mood Tracker",
        description: "Log your first mood entry",
        icon: "😊",
        tier: "bronze",
        category: "positivity",
        requirement: 1,
        current: moodEntries,
        unlocked: moodEntries >= 1,
      },
      {
        id: "wellness-warrior",
        title: "Wellness Warrior",
        description: "Track your mood for 7 days",
        icon: "🌈",
        tier: "silver",
        category: "positivity",
        requirement: 7,
        current: moodEntries,
        unlocked: moodEntries >= 7,
      },
      {
        id: "mood-booster",
        title: "Mood Booster",
        description: "Experience 10 positive mood improvements",
        icon: "⬆️",
        tier: "gold",
        category: "positivity",
        requirement: 10,
        current: positiveImpact,
        unlocked: positiveImpact >= 10,
      },

      // Community Achievements
      {
        id: "heart-giver",
        title: "Heart Giver",
        description: "Like 25 positive stories",
        icon: "❤️",
        tier: "silver",
        category: "community",
        requirement: 25,
        current: likesCount,
        unlocked: likesCount >= 25,
      },
      {
        id: "spread-joy",
        title: "Joy Spreader",
        description: "Share your first positive story",
        icon: "🌻",
        tier: "bronze",
        category: "community",
        requirement: 1,
        current: data.interactions.shares.length,
        unlocked: data.interactions.shares.length >= 1,
      },

      // Special Achievements
      {
        id: "early-adopter",
        title: "Early Adopter",
        description: "One of the first to join BrightSide",
        icon: "🚀",
        tier: "gold",
        category: "special",
        requirement: 1,
        current: 1,
        unlocked: true,
        unlockedAt: data.profile.createdAt,
      },
    ]
  }

  if (!userData) return <div>Loading...</div>

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const lockedAchievements = achievements.filter((a) => !a.unlocked)
  const completionRate = Math.round((unlockedAchievements.length / achievements.length) * 100)

  const tierColors = {
    bronze: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    silver: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    platinum: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  }

  const categoryIcons = {
    reading: Book,
    engagement: Star,
    positivity: Heart,
    community: Trophy,
    special: Crown,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Achievements</h1>
          <p className="text-gray-600 dark:text-gray-300">Celebrate your positive impact journey</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {unlockedAchievements.length}/{achievements.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Unlocked</div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border-orange-200 dark:border-gray-600 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Overall Progress</h3>
            <Badge className="bg-orange-500 text-white">{completionRate}% Complete</Badge>
          </div>
          <Progress value={completionRate} className="h-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {Object.entries(
              unlockedAchievements.reduce(
                (acc, achievement) => {
                  acc[achievement.tier] = (acc[achievement.tier] || 0) + 1
                  return acc
                },
                {} as Record<string, number>,
              ),
            ).map(([tier, count]) => (
              <div key={tier} className="text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{count}</div>
                <div className={`text-sm capitalize ${tierColors[tier as keyof typeof tierColors]}`}>{tier}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Achievements */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Unlocked Achievements ({unlockedAchievements.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unlockedAchievements.map((achievement) => {
            const CategoryIcon = categoryIcons[achievement.category]
            return (
              <Card
                key={achievement.id}
                className="border-orange-200 dark:border-gray-600 bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-gray-700"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={tierColors[achievement.tier]}>{achievement.tier}</Badge>
                        <CategoryIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white truncate">{achievement.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 break-words">{achievement.description}</p>
                  {achievement.unlockedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-gray-400" />
            Locked Achievements ({lockedAchievements.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map((achievement) => {
              const CategoryIcon = categoryIcons[achievement.category]
              const progress = Math.min((achievement.current / achievement.requirement) * 100, 100)

              return (
                <Card key={achievement.id} className="border-gray-200 dark:border-gray-600 opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl grayscale">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-gray-500">
                            {achievement.tier}
                          </Badge>
                          <CategoryIcon className="w-4 h-4 text-gray-400" />
                        </div>
                        <h3 className="font-semibold text-gray-600 dark:text-gray-400 truncate">{achievement.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 break-words">
                      {achievement.description}
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Progress</span>
                        <span>
                          {achievement.current}/{achievement.requirement}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
