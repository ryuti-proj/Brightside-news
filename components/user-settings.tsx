"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type UserData, getUserData, updateUserData } from "@/lib/user-data"
import { Palette, Type, Volume2, Bell, Monitor, Accessibility } from "lucide-react"

export function UserSettings() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [settings, setSettings] = useState({
    theme: "light",
    fontSize: [16],
    fontFamily: "inter",
    reducedMotion: false,
    highContrast: false,
    autoPlayVideos: true,
    soundEffects: true,
    notifications: true,
    compactMode: false,
    showImages: true,
    colorScheme: "default",
  })

  const fontFamilies = [
    { id: "inter", name: "Inter (Default)", class: "font-sans" },
    { id: "serif", name: "Serif", class: "font-serif" },
    { id: "mono", name: "Monospace", class: "font-mono" },
    { id: "georgia", name: "Georgia", class: "font-serif" },
    { id: "helvetica", name: "Helvetica", class: "font-sans" },
    { id: "times", name: "Times New Roman", class: "font-serif" },
    { id: "arial", name: "Arial", class: "font-sans" },
  ]

  const colorSchemes = [
    { id: "default", name: "BrightSide Orange", colors: "from-orange-500 to-pink-600" },
    { id: "blue", name: "Ocean Blue", colors: "from-blue-500 to-cyan-600" },
    { id: "green", name: "Nature Green", colors: "from-green-500 to-emerald-600" },
    { id: "purple", name: "Royal Purple", colors: "from-purple-500 to-violet-600" },
    { id: "red", name: "Warm Red", colors: "from-red-500 to-rose-600" },
    { id: "yellow", name: "Sunny Yellow", colors: "from-yellow-500 to-amber-600" },
  ]

  useEffect(() => {
    const data = getUserData()
    setUserData(data)

    if (data.displaySettings) {
      setSettings({
        theme: data.displaySettings.theme || "light",
        fontSize: data.displaySettings.fontSize || [16],
        fontFamily: data.displaySettings.fontFamily || "inter",
        reducedMotion: data.displaySettings.reducedMotion || false,
        highContrast: data.displaySettings.highContrast || false,
        autoPlayVideos: data.displaySettings.autoPlayVideos ?? true,
        soundEffects: data.displaySettings.soundEffects ?? true,
        notifications: data.displaySettings.notifications ?? true,
        compactMode: data.displaySettings.compactMode || false,
        showImages: data.displaySettings.showImages ?? true,
        colorScheme: data.displaySettings.colorScheme || "default",
      })
    }

    // Load saved theme
    const savedTheme = localStorage.getItem("brightside-theme")
    if (savedTheme) {
      setSettings((prev) => ({ ...prev, theme: savedTheme }))
    }
  }, [])

  const handleSave = () => {
    if (!userData) return

    const updatedData = {
      ...userData,
      displaySettings: settings,
    }

    updateUserData(updatedData)
    setUserData(updatedData)

    // Apply theme immediately
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("brightside-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("brightside-theme", "light")
    }
  }

  const previewText =
    "This is how your text will look with the current settings. BrightSide News brings you daily uplifting stories from around the world."

  if (!userData) return <div>Loading...</div>

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Display Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Customize your reading experience</p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700"
        >
          <Palette className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme & Appearance */}
        <Card className="border-orange-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-500" />
              Theme & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, theme: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Color Scheme</Label>
              <div className="grid grid-cols-2 gap-2">
                {colorSchemes.map((scheme) => (
                  <Button
                    key={scheme.id}
                    variant={settings.colorScheme === scheme.id ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => setSettings((prev) => ({ ...prev, colorScheme: scheme.id }))}
                  >
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${scheme.colors} mr-2`} />
                    <span className="text-xs">{scheme.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="compactMode" className="text-sm font-medium">
                  Compact Mode
                </Label>
                <Switch
                  id="compactMode"
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, compactMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showImages" className="text-sm font-medium">
                  Show Images
                </Label>
                <Switch
                  id="showImages"
                  checked={settings.showImages}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showImages: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="border-orange-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-green-500" />
              Typography
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Font Size: {settings.fontSize[0]}px</Label>
              <Slider
                value={settings.fontSize}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, fontSize: value }))}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Font Family</Label>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, fontFamily: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.id} value={font.id}>
                      <span className={font.class}>{font.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Label className="text-sm font-medium mb-2 block">Preview</Label>
              <p
                className={`${fontFamilies.find((f) => f.id === settings.fontFamily)?.class} text-gray-800 dark:text-white`}
                style={{ fontSize: `${settings.fontSize[0]}px` }}
              >
                {previewText}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card className="border-orange-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-purple-500" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="reducedMotion" className="text-sm font-medium">
                <div>
                  <div>Reduced Motion</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Minimize animations</div>
                </div>
              </Label>
              <Switch
                id="reducedMotion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, reducedMotion: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="highContrast" className="text-sm font-medium">
                <div>
                  <div>High Contrast</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Improve text readability</div>
                </div>
              </Label>
              <Switch
                id="highContrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, highContrast: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media & Sound */}
        <Card className="border-orange-200 dark:border-gray-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-red-500" />
              Media & Sound
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoPlayVideos" className="text-sm font-medium">
                Auto-play Videos
              </Label>
              <Switch
                id="autoPlayVideos"
                checked={settings.autoPlayVideos}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoPlayVideos: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="soundEffects" className="text-sm font-medium">
                Sound Effects
              </Label>
              <Switch
                id="soundEffects"
                checked={settings.soundEffects}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEffects: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Push Notifications
                </div>
              </Label>
              <Switch
                id="notifications"
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, notifications: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Summary */}
      <Card className="border-orange-200 dark:border-gray-600 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
        <CardHeader>
          <CardTitle className="text-lg">Current Settings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-300">Theme:</span>
              <div className="text-orange-600 dark:text-orange-400 capitalize">{settings.theme}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-300">Font Size:</span>
              <div className="text-blue-600 dark:text-blue-400">{settings.fontSize[0]}px</div>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-300">Font:</span>
              <div className="text-green-600 dark:text-green-400">
                {fontFamilies.find((f) => f.id === settings.fontFamily)?.name}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-600 dark:text-gray-300">Color:</span>
              <div className="text-purple-600 dark:text-purple-400">
                {colorSchemes.find((c) => c.id === settings.colorScheme)?.name}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
