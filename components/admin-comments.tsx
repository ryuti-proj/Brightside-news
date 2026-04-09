"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Search, Check, X, Eye, Flag, Calendar, User } from "lucide-react"

interface Comment {
  id: number
  author: string
  email: string
  content: string
  storyTitle: string
  status: "approved" | "pending" | "rejected" | "flagged"
  createdAt: string
  likes: number
  replies: number
}

export function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: "Sarah Johnson",
      email: "sarah@example.com",
      content:
        "This story absolutely made my day! It's so wonderful to see young people making such a positive impact.",
      storyTitle: "8-Year-Old Raises $100K for Clean Water Wells",
      status: "approved",
      createdAt: "2024-01-15 10:30",
      likes: 15,
      replies: 3,
    },
    {
      id: 2,
      author: "Dr. Amanda Rodriguez",
      email: "amanda@example.com",
      content:
        "As someone who works in global health, this breakthrough is incredibly significant. The implications for rare disease treatment are enormous.",
      storyTitle: "Revolutionary Gene Therapy Breakthrough",
      status: "approved",
      createdAt: "2024-01-15 09:15",
      likes: 28,
      replies: 7,
    },
    {
      id: 3,
      author: "Mike Chen",
      email: "mike@example.com",
      content:
        "This gives me hope for my daughter who has a similar condition. Thank you for sharing this amazing news!",
      storyTitle: "Revolutionary Gene Therapy Breakthrough",
      status: "pending",
      createdAt: "2024-01-15 08:45",
      likes: 0,
      replies: 0,
    },
    {
      id: 4,
      author: "Anonymous User",
      email: "anon@example.com",
      content: "This seems too good to be true. Are we sure this isn't just propaganda?",
      storyTitle: "Community Garden Transforms Neighborhood",
      status: "flagged",
      createdAt: "2024-01-14 16:20",
      likes: 0,
      replies: 0,
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [storyFilter, setStoryFilter] = useState("all")

  const stories = Array.from(new Set(comments.map((comment) => comment.storyTitle)))

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter
    const matchesStory = storyFilter === "all" || comment.storyTitle === storyFilter
    return matchesSearch && matchesStatus && matchesStory
  })

  const handleUpdateCommentStatus = (commentId: number, newStatus: Comment["status"]) => {
    setComments(comments.map((comment) => (comment.id === commentId ? { ...comment, status: newStatus } : comment)))
  }

  const handleDeleteComment = (commentId: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      setComments(comments.filter((comment) => comment.id !== commentId))
    }
  }

  const totalComments = comments.length
  const approvedComments = comments.filter((comment) => comment.status === "approved").length
  const pendingComments = comments.filter((comment) => comment.status === "pending").length
  const flaggedComments = comments.filter((comment) => comment.status === "flagged").length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Comments Management</h2>
        <p className="text-gray-600">Moderate and manage user comments on stories</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Comments</p>
                <p className="text-2xl font-bold">{totalComments}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{approvedComments}</p>
              </div>
              <Check className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{pendingComments}</p>
              </div>
              <Eye className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flagged</p>
                <p className="text-2xl font-bold">{flaggedComments}</p>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
            <Select value={storyFilter} onValueChange={setStoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Story" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stories</SelectItem>
                {stories.map((story) => (
                  <SelectItem key={story} value={story}>
                    {story.length > 30 ? story.substring(0, 30) + "..." : story}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({filteredComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredComments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {comment.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-800">{comment.author}</h4>
                        <Badge
                          variant={
                            comment.status === "approved"
                              ? "default"
                              : comment.status === "pending"
                                ? "secondary"
                                : comment.status === "flagged"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {comment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {comment.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {comment.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {comment.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateCommentStatus(comment.id, "approved")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateCommentStatus(comment.id, "rejected")}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {comment.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateCommentStatus(comment.id, "flagged")}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Flag className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-gray-800 mb-2">{comment.content}</p>
                  <p className="text-sm text-gray-600">
                    On story: <span className="font-medium">{comment.storyTitle}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{comment.likes} likes</span>
                  <span>{comment.replies} replies</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
