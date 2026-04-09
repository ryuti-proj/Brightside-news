"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type UserData, getUserData } from "@/lib/user-data"
import { Search, MessageCircle, Heart, Share2, Calendar, ExternalLink, ThumbsUp, Reply } from "lucide-react"

export function UserInteractions() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const data = getUserData()
    setUserData(data)
  }, [])

  if (!userData) return <div>Loading...</div>

  const filteredComments = userData.interactions.comments.filter(
    (comment) =>
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.articleTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredLikes = userData.interactions.likes.filter((like) =>
    like.articleTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredShares = userData.interactions.shares.filter((share) =>
    share.articleTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Interactions</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your engagement with positive stories</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {userData.interactions.comments.length} comments
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            {userData.interactions.likes.length} likes
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {userData.interactions.shares.length} shares
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search your interactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comments" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Comments ({filteredComments.length})
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Likes ({filteredLikes.length})
          </TabsTrigger>
          <TabsTrigger value="shares" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Shares ({filteredShares.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                {searchTerm ? "No matching comments" : "No comments yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search" : "Start engaging with stories that inspire you!"}
              </p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <Card key={comment.id} className="border-orange-200 dark:border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {comment.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                    {comment.likes && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <ThumbsUp className="w-3 h-3" />
                        {comment.likes}
                      </div>
                    )}
                    {comment.replies && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Reply className="w-3 h-3" />
                        {comment.replies}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 break-words">
                    {comment.articleTitle}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg break-words">
                    "{comment.content}"
                  </p>
                  <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Article
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="likes" className="space-y-4">
          {filteredLikes.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                {searchTerm ? "No matching likes" : "No likes yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search" : "Start liking stories that brighten your day!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLikes.map((like) => (
                <Card key={like.id} className="border-orange-200 dark:border-gray-600">
                  <div className="flex gap-4 p-4">
                    <img
                      src={like.image || "/placeholder.svg"}
                      alt={like.articleTitle}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {like.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(like.likedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 break-words">
                        {like.articleTitle}
                      </h3>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 p-0">
                        <Heart className="w-4 h-4 mr-1 fill-current" />
                        Liked
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="shares" className="space-y-4">
          {filteredShares.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                {searchTerm ? "No matching shares" : "No shares yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm ? "Try adjusting your search" : "Start sharing positive stories with others!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredShares.map((share) => (
                <Card key={share.id} className="border-orange-200 dark:border-gray-600">
                  <div className="flex gap-4 p-4">
                    <img
                      src={share.image || "/placeholder.svg"}
                      alt={share.articleTitle}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {share.category}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {share.platform}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(share.sharedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2 break-words">
                        {share.articleTitle}
                      </h3>
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 p-0">
                        <Share2 className="w-4 h-4 mr-1" />
                        Shared on {share.platform}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
