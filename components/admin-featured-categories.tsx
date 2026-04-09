"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { allCategories } from "@/lib/categories"
import { Star, Plus, X, ChevronUp, ChevronDown, Save, RotateCcw } from "lucide-react"

export class FeaturedCategoriesService {
  private static instance: FeaturedCategoriesService
  private featuredCategories: string[] = []

  static getInstance(): FeaturedCategoriesService {
    if (!FeaturedCategoriesService.instance) {
      FeaturedCategoriesService.instance = new FeaturedCategoriesService()
    }
    return FeaturedCategoriesService.instance
  }

  getFeaturedCategories(): string[] {
    if (this.featuredCategories.length === 0) {
      this.loadFromStorage()
    }
    return [...this.featuredCategories]
  }

  setFeaturedCategories(categories: string[]): void {
    this.featuredCategories = [...categories]
    this.saveToStorage()
  }

  addCategory(category: string): void {
    if (!this.featuredCategories.includes(category)) {
      this.featuredCategories.push(category)
      this.saveToStorage()
    }
  }

  removeCategory(category: string): void {
    this.featuredCategories = this.featuredCategories.filter((c) => c !== category)
    this.saveToStorage()
  }

  moveCategory(fromIndex: number, toIndex: number): void {
    const categories = [...this.featuredCategories]
    const [movedCategory] = categories.splice(fromIndex, 1)
    categories.splice(toIndex, 0, movedCategory)
    this.featuredCategories = categories
    this.saveToStorage()
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("brightside-featured-categories", JSON.stringify(this.featuredCategories))
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("brightside-featured-categories")
      if (stored) {
        try {
          this.featuredCategories = JSON.parse(stored)
        } catch (error) {
          console.error("Failed to load featured categories:", error)
          this.initializeDefaults()
        }
      } else {
        this.initializeDefaults()
      }
    }
  }

  private initializeDefaults(): void {
    this.featuredCategories = [
      "Inspirational Stories",
      "Health & Wellbeing",
      "Community & Kindness",
      "Environment",
      "Science & Breakthroughs",
      "Children",
      "Arts & Culture",
      "Animals & Wildlife",
    ]
    this.saveToStorage()
  }
}

export function AdminFeaturedCategories() {
  const [service] = useState(() => FeaturedCategoriesService.getInstance())
  const [featuredCategories, setFeaturedCategories] = useState<string[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const featured = service.getFeaturedCategories()
    setFeaturedCategories(featured)
    setAvailableCategories(allCategories.filter((cat) => cat !== "All" && !featured.includes(cat)))
  }, [service])

  const handleAddCategory = (category: string) => {
    const newFeatured = [...featuredCategories, category]
    setFeaturedCategories(newFeatured)
    setAvailableCategories(availableCategories.filter((c) => c !== category))
    setHasChanges(true)
  }

  const handleRemoveCategory = (category: string) => {
    const newFeatured = featuredCategories.filter((c) => c !== category)
    setFeaturedCategories(newFeatured)
    setAvailableCategories([...availableCategories, category].sort())
    setHasChanges(true)
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newFeatured = [...featuredCategories]
      ;[newFeatured[index - 1], newFeatured[index]] = [newFeatured[index], newFeatured[index - 1]]
      setFeaturedCategories(newFeatured)
      setHasChanges(true)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < featuredCategories.length - 1) {
      const newFeatured = [...featuredCategories]
      ;[newFeatured[index], newFeatured[index + 1]] = [newFeatured[index + 1], newFeatured[index]]
      setFeaturedCategories(newFeatured)
      setHasChanges(true)
    }
  }

  const handleSave = () => {
    service.setFeaturedCategories(featuredCategories)
    setHasChanges(false)
    alert("Featured categories updated successfully!")
  }

  const handleReset = () => {
    const defaultCategories = [
      "Inspirational Stories",
      "Health & Wellbeing",
      "Community & Kindness",
      "Environment",
      "Science & Breakthroughs",
      "Children",
      "Arts & Culture",
      "Animals & Wildlife",
    ]
    setFeaturedCategories(defaultCategories)
    setAvailableCategories(allCategories.filter((cat) => cat !== "All" && !defaultCategories.includes(cat)))
    setHasChanges(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Featured Categories Management</h2>
        <p className="text-gray-600">Manage which categories appear in the main page carousel</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={!hasChanges} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>
        {hasChanges && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Unsaved Changes
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-sky-600" />
              Featured Categories ({featuredCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {featuredCategories.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No featured categories selected</p>
            ) : (
              featuredCategories.map((category, index) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-sky-50 border border-sky-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-gray-800">{category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 h-auto"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === featuredCategories.length - 1}
                      className="p-1 h-auto"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCategory(category)}
                      className="p-1 h-auto text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Available Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Available Categories ({availableCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableCategories.length === 0 ? (
              <p className="text-center text-gray-500 py-8">All categories are featured</p>
            ) : (
              availableCategories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700">{category}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAddCategory(category)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Carousel Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              The carousel will display stories from these categories in this order:
            </p>
            <div className="flex flex-wrap gap-2">
              {featuredCategories.map((category, index) => (
                <Badge key={category} variant="outline" className="border-sky-200 text-sky-700">
                  {index + 1}. {category}
                </Badge>
              ))}
            </div>
            {featuredCategories.length === 0 && (
              <p className="text-gray-500 italic">No categories selected for carousel</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
