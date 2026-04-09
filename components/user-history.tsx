"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type UserData, getUserData } from "@/lib/user-data"
import { Search, Clock, Heart, Calendar, TrendingUp, Book } from "lucide-react"

export function UserHistory() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")

  useEffect(() => {
    const data = getUserData()
    setUserData(data)
  }, [])

  if (!userData) return <div>Loading...</div>

  const totalReadingTime = userData.readingHistory.reduce((total, item) => total + item.readingTime, 0)
  const averageReadingTime = userData.readingHistory.length > 0 ? totalReadingTime / userData.readingHistory.length : 0
  const topCategory = userData.readingHistory.reduce(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )
  const mostReadCategory = Object.entries(topCategory).sort(([, a], [, b]) => b - a)[0]?.[0] || "None"

  const filteredHistory = userData.readingHistory
    .filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.readAt).getTime() - new Date(a.readAt).getTime()
        case "oldest":
          return new Date(a.readAt).getTime() - new Date(b.readAt).getTime()
        case "duration":
          return b.readingTime - a.readingTime
        default:
          return 0
      }
    })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reading History</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your journey through positive news</p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {userData.readingHistory.length} stories read
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-orange-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-white">{Math.floor(totalReadingTime / 60)}m</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Reading Time</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-white">
              {Math.floor(averageReadingTime / 60)}m
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Average per Story</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 dark:border-gray-600">
          <CardContent className="p-4 text-center">
            <Book className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-gray-800 dark:text-white truncate">{mostReadCategory}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Top Category</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your reading history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="duration">Reading Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            {searchTerm ? "No matching stories" : "No reading history yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? "Try adjusting your search" : "Start reading some uplifting stories!"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <Card key={item.id} className="border-orange-200 dark:border-gray-600">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.readAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {Math.floor(item.readingTime / 60)}m read
                      </div>
                      {item.liked && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                    </div>
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1 line-clamp-2 break-words">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 break-words">{item.excerpt}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
                      By {item.author} • {item.source}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
