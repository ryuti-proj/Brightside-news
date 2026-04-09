"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type UserData, getUserData, removeBookmark } from "@/lib/user-data"
import { Search, Bookmark, Trash2, Heart, Calendar } from "lucide-react"

export function UserBookmarks() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("all")

  useEffect(() => {
    const data = getUserData()
    setUserData(data)
  }, [])

  const handleRemoveBookmark = (bookmarkId: string) => {
    if (confirm("Remove this story from your bookmarks?")) {
      removeBookmark(bookmarkId)
      const updatedData = getUserData()
      setUserData(updatedData)
    }
  }

  if (!userData) return <div>Loading...</div>

  const filteredBookmarks = userData.bookmarks.filter((bookmark) => {
    const matchesSearch =
      bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bookmark.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFolder = selectedFolder === "all" || bookmark.folderId === selectedFolder
    return matchesSearch && matchesFolder
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Saved Stories</h1>
          <p className="text-gray-600 dark:text-gray-300">Your collection of uplifting stories</p>
        </div>
        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
          {userData.bookmarks.length} saved
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your saved stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedFolder} onValueChange={setSelectedFolder}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All folders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Bookmarks</SelectItem>
            {userData.bookmarkFolders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${folder.color}-500`} />
                  {folder.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
            {searchTerm || selectedFolder !== "all" ? "No matching bookmarks" : "No saved stories yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedFolder !== "all"
              ? "Try adjusting your search or filter"
              : "Start saving stories that brighten your day!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <Card
              key={bookmark.id}
              className="border-orange-200 dark:border-gray-600 hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={bookmark.image || "/placeholder.svg"}
                  alt={bookmark.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 w-8 h-8 p-0 bg-red-500/80 hover:bg-red-600"
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {bookmark.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {new Date(bookmark.savedAt).toLocaleDateString()}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 break-words">
                  {bookmark.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 break-words">
                  {bookmark.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span className="truncate mr-2">{bookmark.source}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Heart className="w-3 h-3" />
                    {bookmark.likes}
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
