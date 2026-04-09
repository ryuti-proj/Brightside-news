"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { allCategories, getCategoryGroup } from "@/lib/categories"
import { FileText, Plus, Edit, Trash2, Eye, Search, TrendingUp } from "lucide-react"

interface Story {
  id: number
  title: string
  excerpt: string
  category: string
  country: string
  status: "published" | "draft" | "pending"
  views: number
  likes: number
  comments: number
  publishedAt: string
  author: string
}

export function AdminStories() {
  const [stories, setStories] = useState<Story[]>([
    {
      id: 1,
      title: "8-Year-Old Raises $100K for Clean Water Wells",
      excerpt: "Emma Thompson's lemonade stand initiative has grown into a global movement...",
      category: "Children",
      country: "Kenya",
      status: "published",
      views: 15420,
      likes: 1247,
      comments: 89,
      publishedAt: "2024-01-15",
      author: "Sarah Johnson",
    },
    {
      id: 2,
      title: "Revolutionary Gene Therapy Breakthrough",
      excerpt: "Scientists at Oxford University have successfully treated 15 children...",
      category: "Science & Breakthroughs",
      country: "United Kingdom",
      status: "published",
      views: 12340,
      likes: 892,
      comments: 156,
      publishedAt: "2024-01-14",
      author: "Dr. Michael Chen",
    },
    {
      id: 3,
      title: "Community Garden Transforms Neighborhood",
      excerpt: "Local residents unite to create beautiful green spaces...",
      category: "Community & Kindness",
      country: "United States",
      status: "draft",
      views: 0,
      likes: 0,
      comments: 0,
      publishedAt: "",
      author: "Emma Rodriguez",
    },
    {
      id: 4,
      title: "Local Marathon Runner Raises Mental Health Awareness",
      excerpt: "Sarah Mitchell completes 26 marathons in 26 weeks...",
      category: "Sports & Wellness",
      country: "Australia",
      status: "published",
      views: 8750,
      likes: 567,
      comments: 43,
      publishedAt: "2024-01-13",
      author: "Mike Thompson",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Load custom categories from localStorage
  const [customCategories, setCustomCategories] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("brightside-categories")
    if (saved) {
      try {
        const categoryData = JSON.parse(saved)
        const flatCategories = categoryData.groups.flatMap((group: any) => group.categories)
        setCustomCategories(["All", ...flatCategories])
      } catch (error) {
        setCustomCategories(allCategories)
      }
    } else {
      setCustomCategories(allCategories)
    }
  }, [])

  const categories = customCategories.length > 0 ? customCategories.slice(1) : allCategories.slice(1) // Remove "All"

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "Brazil",
    "India",
    "Kenya",
  ]

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || story.status === statusFilter
    const matchesCategory = categoryFilter === "all" || story.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const handleDeleteStory = (id: number) => {
    if (confirm("Are you sure you want to delete this story?")) {
      setStories(stories.filter((story) => story.id !== id))
    }
  }

  const handlePublishStory = (id: number) => {
    setStories(
      stories.map((story) =>
        story.id === id
          ? { ...story, status: "published" as const, publishedAt: new Date().toISOString().split("T")[0] }
          : story,
      ),
    )
  }

  const handleSaveStory = (updatedStory: Story) => {
    if (updatedStory.id === 0) {
      // New story
      const newStory = { ...updatedStory, id: Math.max(...stories.map((s) => s.id)) + 1 }
      setStories([newStory, ...stories])
    } else {
      // Update existing story
      setStories(stories.map((story) => (story.id === updatedStory.id ? updatedStory : story)))
    }
    setEditingStory(null)
    setShowAddForm(false)
  }

  const totalViews = stories.reduce((sum, story) => sum + story.views, 0)
  const totalLikes = stories.reduce((sum, story) => sum + story.likes, 0)
  const publishedCount = stories.filter((story) => story.status === "published").length
  const draftCount = stories.filter((story) => story.status === "draft").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Stories Management</h2>
          <p className="text-gray-600">Create, edit, and manage your uplifting stories</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Story
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published Stories</p>
                <p className="text-2xl font-bold">{publishedCount}</p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft Stories</p>
                <p className="text-2xl font-bold">{draftCount}</p>
              </div>
              <Edit className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Likes</p>
                <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
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
                  placeholder="Search stories..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stories List */}
      <Card>
        <CardHeader>
          <CardTitle>Stories ({filteredStories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStories.map((story) => (
              <div key={story.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">{story.title}</h3>
                      <Badge
                        variant={
                          story.status === "published" ? "default" : story.status === "draft" ? "secondary" : "outline"
                        }
                      >
                        {story.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{story.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Category: {story.category}</span>
                      <span>Group: {getCategoryGroup(story.category) || "Unknown"}</span>
                      <span>Country: {story.country}</span>
                      <span>Author: {story.author}</span>
                      {story.publishedAt && <span>Published: {story.publishedAt}</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>{story.views.toLocaleString()} views</span>
                      <span>{story.likes} likes</span>
                      <span>{story.comments} comments</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {story.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => handlePublishStory(story.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setEditingStory(story)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteStory(story.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Story Modal */}
      {(showAddForm || editingStory) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingStory ? "Edit Story" : "Add New Story"}</CardTitle>
            </CardHeader>
            <CardContent>
              <StoryForm
                story={
                  editingStory || {
                    id: 0,
                    title: "",
                    excerpt: "",
                    category: categories[0],
                    country: countries[0],
                    status: "draft",
                    views: 0,
                    likes: 0,
                    comments: 0,
                    publishedAt: "",
                    author: "Admin",
                  }
                }
                categories={categories}
                countries={countries}
                onSave={handleSaveStory}
                onCancel={() => {
                  setEditingStory(null)
                  setShowAddForm(false)
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function StoryForm({
  story,
  categories,
  countries,
  onSave,
  onCancel,
}: {
  story: Story
  categories: string[]
  countries: string[]
  onSave: (story: Story) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState(story)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={3}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="pending">Pending Review</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Save Story
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
