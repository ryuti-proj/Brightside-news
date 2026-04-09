"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoryManager, type CategoryGroup } from "@/lib/categories"
import { RefreshCw, Folder, Tag } from "lucide-react"

export function AdminCategories() {
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const categoryManager = CategoryManager.getInstance()

  const loadCategories = () => {
    setCategories(categoryManager.getCategories())
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const totalCategories = categories.reduce(
    (sum, group) => sum + group.categories.length,
    0
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Category Management</h2>
          <p className="text-gray-600">Categories are loading from the local manager.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadCategories}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Category Groups</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Categories</p>
                <p className="text-2xl font-bold">{totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-gray-600">Average per Group</p>
              <p className="text-2xl font-bold">
                {categories.length > 0 ? Math.round(totalCategories / categories.length) : 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories found.</p>
          ) : (
            categories.map((group) => (
              <div key={group.name} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{group.name}</h3>
                    {group.description ? (
                      <p className="text-sm text-gray-600">{group.description}</p>
                    ) : null}
                  </div>
                  <span className="text-sm text-gray-500">
                    {group.categories.length} categories
                  </span>
                </div>

                {group.categories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.categories.map((category) => (
                      <span
                        key={`${group.name}-${category}`}
                        className="rounded-full border px-3 py-1 text-sm"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}