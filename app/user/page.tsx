"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { UserProfile } from "@/components/user-profile"
import { UserBookmarks } from "@/components/user-bookmarks"
import { UserHistory } from "@/components/user-history"
import { UserFeedSettings } from "@/components/user-feed-settings"
import { UserInteractions } from "@/components/user-interactions"
import { UserMoodTracker } from "@/components/user-mood-tracker"
import { UserAchievements } from "@/components/user-achievements"
import { UserSettings } from "@/components/user-settings"
import { UserEmailHistory } from "@/components/user-email-history"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  User,
  Bookmark,
  History,
  Settings,
  MessageCircle,
  Heart,
  Trophy,
  Palette,
  Mail,
  ChevronLeft,
} from "lucide-react"

const menuItems = [
  { id: "profile", label: "Profile", icon: User, component: UserProfile },
  { id: "bookmarks", label: "Saved Stories", icon: Bookmark, component: UserBookmarks },
  { id: "history", label: "Reading History", icon: History, component: UserHistory },
  { id: "feed-settings", label: "Feed Settings", icon: Settings, component: UserFeedSettings },
  { id: "interactions", label: "Interactions", icon: MessageCircle, component: UserInteractions },
  { id: "mood", label: "Mood Tracker", icon: Heart, component: UserMoodTracker },
  { id: "achievements", label: "Achievements", icon: Trophy, component: UserAchievements },
  { id: "email-history", label: "Email History", icon: Mail, component: UserEmailHistory },
  { id: "settings", label: "App Settings", icon: Palette, component: UserSettings },
]

export default function UserPage() {
  const [activeSection, setActiveSection] = useState("profile")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true)
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your user area...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Required</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please sign in to access your personal user area and manage your BrightSide News experience.
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700"
              >
                Sign In / Register
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    )
  }

  const ActiveComponent = menuItems.find((item) => item.id === activeSection)?.component || UserProfile

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="border-orange-200 dark:border-gray-600 sticky top-8">
              <CardContent className="p-6">
                {/* User Info */}
                <div className="text-center mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{user?.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{user?.email}</p>
                </div>

                {/* Navigation Menu */}
                <nav className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeSection === item.id
                            ? "bg-gradient-to-r from-orange-500 to-pink-600 text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </nav>

                {/* Back to Home */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/")}
                    className="w-full justify-start border-gray-200 dark:border-gray-600"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Card className="border-orange-200 dark:border-gray-600 min-h-[600px]">
              <ActiveComponent />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
