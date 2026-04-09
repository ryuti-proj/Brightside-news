"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type UserData, getUserData, updateUserData } from "@/lib/user-data"
import { useNotifications } from "@/hooks/use-notifications"
import { emailService } from "@/lib/email-service"
import { useAuth } from "@/contexts/auth-context"
import { Settings, Bell, Globe, Clock, Filter, Save } from "lucide-react"

export function UserFeedSettings() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState({
    categories: {
      inspirational: true,
      health: true,
      environment: true,
      technology: true,
      community: false,
      animals: true,
      science: false,
      arts: false,
      sports: false,
      education: false,
    },
    notifications: {
      email: true,
      push: false,
      daily: true,
      weekly: false,
    },
    frequency: [3], // Stories per day
    region: "global",
    language: "en",
  })

  const { success, info } = useNotifications()
  const { user } = useAuth()

  useEffect(() => {
    const data = getUserData()
    setUserData(data)
    if (data.feedSettings) {
      setSettings(data.feedSettings)
    }
  }, [])

  const handleCategoryChange = (category: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: enabled,
      },
    }))
    setHasChanges(true)
  }

  const handleNotificationChange = (type: string, enabled: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: enabled,
      },
    }))
    setHasChanges(true)
  }

  const handleFrequencyChange = (value: number[]) => {
    setSettings((prev) => ({
      ...prev,
      frequency: value,
    }))
    setHasChanges(true)
  }

  const handleRegionChange = (region: string) => {
    setSettings((prev) => ({
      ...prev,
      region,
    }))
    setHasChanges(true)
  }

  const handleLanguageChange = (language: string) => {
    setSettings((prev) => ({
      ...prev,
      language,
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!userData || !user) return

    const updatedData = {
      ...userData,
      feedSettings: settings,
      profile: {
        ...userData.profile,
        updatedAt: new Date().toISOString(),
      },
    }

    updateUserData(updatedData)
    setUserData(updatedData)
    setHasChanges(false)

    // Collect changes for email notification
    const changes = []

    // Check category changes
    const enabledCategories = Object.entries(settings.categories)
      .filter(([_, enabled]) => enabled)
      .map(([category, _]) => category.charAt(0).toUpperCase() + category.slice(1))

    if (enabledCategories.length > 0) {
      changes.push(`Preferred categories: ${enabledCategories.join(", ")}`)
    }

    // Check notification changes
    if (settings.notifications.email) {
      changes.push("Email notifications enabled")
    }
    if (settings.notifications.daily) {
      changes.push("Daily digest enabled")
    }
    if (settings.notifications.weekly) {
      changes.push("Weekly summary enabled")
    }

    // Check frequency changes
    changes.push(`Stories per day: ${settings.frequency[0]}`)

    // Check region changes
    if (settings.region !== "global") {
      changes.push(`Region preference: ${settings.region}`)
    }

    // Send email notification about preferences update
    if (changes.length > 0) {
      await emailService.sendPreferencesUpdatedEmail(user.email, user.name, changes)
    }

    success("Settings Saved!", "Your feed preferences have been updated successfully.")
  }

  if (!userData) return <div>Loading...</div>

  const categoryOptions = [
    { key: "inspirational", label: "Inspirational Stories", icon: "✨" },
    { key: "health", label: "Health & Wellness", icon: "🏥" },
    { key: "environment", label: "Environment & Nature", icon: "🌱" },
    { key: "technology", label: "Technology & Innovation", icon: "💡" },
    { key: "community", label: "Community & Kindness", icon: "🤝" },
    { key: "animals", label: "Animals & Wildlife", icon: "🐾" },
    { key: "science", label: "Science & Breakthroughs", icon: "🔬" },
    { key: "arts", label: "Arts & Culture", icon: "🎨" },
    { key: "sports", label: "Sports & Achievement", icon: "🏆" },
    { key: "education", label: "Education & Learning", icon: "📚" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-500" />
            Feed Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Customize your news feed and notification preferences</p>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Preferences */}
        <Card className="border-orange-200 dark:border-gray-600">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-500" />
              Content Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Choose your favorite categories:
              </Label>
              <div className="space-y-3">
                {categoryOptions.map((category) => (
                  <div key={category.key} className="flex items-center justify-between">
                    <Label htmlFor={category.key} className="flex items-center gap-2 cursor-pointer">
                      <span className="text-lg">{category.icon}</span>
                      <span className="text-sm">{category.label}</span>
                    </Label>
                    <Switch
                      id={category.key}
                      checked={settings.categories[category.key as keyof typeof settings.categories]}
                      onCheckedChange={(checked) => handleCategoryChange(category.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Stories per day: {settings.frequency[0]}
              </Label>
              <Slider
                value={settings.frequency}
                onValueChange={handleFrequencyChange}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification & Regional Settings */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card className="border-orange-200 dark:border-gray-600">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="text-sm">
                  Email Notifications
                </Label>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="push-notifications" className="text-sm">
                  Push Notifications
                </Label>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-digest" className="text-sm">
                  Daily Digest
                </Label>
                <Switch
                  id="daily-digest"
                  checked={settings.notifications.daily}
                  onCheckedChange={(checked) => handleNotificationChange("daily", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weekly-summary" className="text-sm">
                  Weekly Summary
                </Label>
                <Switch
                  id="weekly-summary"
                  checked={settings.notifications.weekly}
                  onCheckedChange={(checked) => handleNotificationChange("weekly", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Regional Settings */}
          <Card className="border-orange-200 dark:border-gray-600">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-500" />
                Regional Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Preferred Region
                </Label>
                <Select value={settings.region} onValueChange={handleRegionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="africa">Africa</SelectItem>
                    <SelectItem value="south-america">South America</SelectItem>
                    <SelectItem value="oceania">Oceania</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Language</Label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="it">Italian</SelectItem>
                    <SelectItem value="pt">Portuguese</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="ko">Korean</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              You have unsaved changes. Click "Save Changes" to apply your new preferences.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
