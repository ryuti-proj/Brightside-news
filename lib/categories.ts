"use client"

// Category structure with hierarchical organization
export interface CategoryGroup {
  name: string
  categories: string[]
  description?: string
}

export const categoryGroups: CategoryGroup[] = [
  {
    name: "Human Spirit",
    categories: ["Inspirational Stories", "Community & Kindness", "Children", "Health & Wellbeing"],
    description: "Stories that celebrate the best of humanity and personal triumph",
  },
  {
    name: "Planet & Nature",
    categories: ["Environment", "Animals & Wildlife"],
    description: "Environmental conservation and wildlife protection stories",
  },
  {
    name: "Growth & Learning",
    categories: ["Education", "Arts & Culture"],
    description: "Educational achievements and cultural celebrations",
  },
  {
    name: "Progress & Innovation",
    categories: ["Science & Breakthroughs", "Technology"],
    description: "Scientific discoveries and technological innovations for good",
  },
  {
    name: "Positive Action & Achievement",
    categories: ["Sports & Wellness", "Social Impact"],
    description: "Athletic achievements and social change initiatives",
  },
  {
    name: "Bright Horizons",
    categories: ["Good Business", "Everyday Heroes", "Uplifting World"],
    description: "Business doing good, heroic acts, and global positive change",
  },
]

// Flatten all categories for easy access
export const allCategories = ["All", ...categoryGroups.flatMap((group) => group.categories)]

// Category descriptions
export const categoryDescriptions: Record<string, string> = {
  "Inspirational Stories": "Remarkable tales of human resilience and triumph over adversity",
  "Community & Kindness": "Heartwarming stories of neighbors helping neighbors and acts of compassion",
  Children: "Young people making a difference and stories that inspire the next generation",
  "Health & Wellbeing": "Medical breakthroughs, wellness initiatives, and stories of healing",
  Environment: "Conservation efforts, sustainability projects, and environmental restoration",
  "Animals & Wildlife": "Wildlife conservation, animal rescue stories, and biodiversity protection",
  Education: "Educational innovations, learning achievements, and knowledge sharing",
  "Arts & Culture": "Creative expressions, cultural celebrations, and artistic achievements",
  "Science & Breakthroughs": "Scientific discoveries, research achievements, and innovation",
  Technology: "Tech innovations that improve lives and solve global challenges",
  "Sports & Wellness": "Athletic achievements, fitness initiatives, and wellness programs",
  "Social Impact": "Social justice, equality initiatives, and positive social change",
  "Good Business": "Companies and entrepreneurs making a positive impact",
  "Everyday Heroes": "Ordinary people doing extraordinary things in their communities",
  "Uplifting World": "Global cooperation, international aid, and worldwide positive initiatives",
}

// Helper function to get the group name for a category
export function getCategoryGroup(category: string): string {
  for (const group of categoryGroups) {
    if (group.categories.includes(category)) {
      return group.name
    }
  }
  return "Other"
}

// Helper function to get categories by group
export function getCategoriesByGroup(groupName: string): string[] {
  const group = categoryGroups.find((g) => g.name === groupName)
  return group ? group.categories : []
}

// Category management functions for admin
export class CategoryManager {
  private static instance: CategoryManager
  private categories: CategoryGroup[] = [...categoryGroups]

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): CategoryManager {
    if (!CategoryManager.instance) {
      CategoryManager.instance = new CategoryManager()
    }
    return CategoryManager.instance
  }

  private loadFromStorage(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("brightside-categories")
      if (stored) {
        try {
          this.categories = JSON.parse(stored)
        } catch (error) {
          console.error("Failed to load categories from storage:", error)
        }
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("brightside-categories", JSON.stringify(this.categories))
    }
  }

  getCategories(): CategoryGroup[] {
    return [...this.categories]
  }

  addGroup(name: string, description?: string): boolean {
    if (this.categories.find((g) => g.name === name)) {
      return false // Group already exists
    }
    this.categories.push({ name, categories: [], description })
    this.saveToStorage()
    return true
  }

  removeGroup(name: string): boolean {
    const index = this.categories.findIndex((g) => g.name === name)
    if (index === -1) return false
    this.categories.splice(index, 1)
    this.saveToStorage()
    return true
  }

  updateGroup(oldName: string, newName: string, description?: string): boolean {
    const group = this.categories.find((g) => g.name === oldName)
    if (!group) return false
    group.name = newName
    if (description !== undefined) group.description = description
    this.saveToStorage()
    return true
  }

  addCategory(groupName: string, categoryName: string): boolean {
    const group = this.categories.find((g) => g.name === groupName)
    if (!group) return false
    if (group.categories.includes(categoryName)) return false
    group.categories.push(categoryName)
    this.saveToStorage()
    return true
  }

  removeCategory(groupName: string, categoryName: string): boolean {
    const group = this.categories.find((g) => g.name === groupName)
    if (!group) return false
    const index = group.categories.indexOf(categoryName)
    if (index === -1) return false
    group.categories.splice(index, 1)
    this.saveToStorage()
    return true
  }

  updateCategory(groupName: string, oldName: string, newName: string): boolean {
    const group = this.categories.find((g) => g.name === groupName)
    if (!group) return false
    const index = group.categories.indexOf(oldName)
    if (index === -1) return false
    group.categories[index] = newName
    this.saveToStorage()
    return true
  }

  exportCategories(): string {
    return JSON.stringify(this.categories, null, 2)
  }

  importCategories(data: string): boolean {
    try {
      const imported = JSON.parse(data)
      if (Array.isArray(imported)) {
        this.categories = imported
        this.saveToStorage()
        return true
      }
    } catch (error) {
      console.error("Failed to import categories:", error)
    }
    return false
  }

  resetToDefault(): void {
    this.categories = [...categoryGroups]
    this.saveToStorage()
  }
}
