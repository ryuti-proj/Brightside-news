"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/hooks/use-notifications"
import { AuthModal } from "./auth-modal"
import { User, Settings, LogOut, ChevronDown, UserCircle, Heart, BookOpen, Trophy, Smartphone } from "lucide-react"

export function UserMenu() {
  const { user, isAuthenticated, logout, isPiUser, authProvider } = useAuth()
  const { info } = useNotifications()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogin = () => {
    setAuthMode("login")
    setShowAuthModal(true)
  }

  const handleRegister = () => {
    setAuthMode("register")
    setShowAuthModal(true)
  }

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    info("Logged Out", "You have been successfully logged out. See you soon!")
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleLogin}
            className="hidden sm:flex border-sky-200 text-sky-600 hover:bg-sky-50 bg-transparent"
          >
            Sign In
          </Button>
          <Button
            onClick={handleRegister}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
          >
            <UserCircle className="w-4 h-4 mr-2 sm:mr-2" />
            <span className="hidden sm:inline">Get Started</span>
            <span className="sm:hidden">Join</span>
          </Button>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode={authMode} />
      </>
    )
  }

  const displayEmail = isPiUser
    ? `${user?.piUsername || user?.name}@pi.local`
    : user?.email || "No email available"

  const displayAccountLabel = isPiUser
    ? "Pi account"
    : authProvider === "web"
      ? `${user?.provider} account`
      : "Account"

  return (
    <>
      <div className="relative">
        <Button
          variant="ghost"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:bg-sky-50 dark:hover:bg-gray-700"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback className="bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name}</span>
          {isPiUser && <Smartphone className="hidden sm:inline w-4 h-4 text-sky-500" />}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />

            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayEmail}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {isPiUser && <Smartphone className="w-3 h-3 text-sky-500" />}
                      <p className="text-xs text-sky-600 dark:text-sky-400 capitalize">{displayAccountLabel}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="py-2">
                <a
                  href="/user"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="w-4 h-4" />
                  Your Profile
                </a>

                <a
                  href="/user?tab=bookmarks"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  <Heart className="w-4 h-4" />
                  Saved Stories
                </a>

                <a
                  href="/user?tab=history"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  <BookOpen className="w-4 h-4" />
                  Reading History
                </a>

                <a
                  href="/user?tab=achievements"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  <Trophy className="w-4 h-4" />
                  Achievements
                </a>

                <a
                  href="/user?tab=settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </a>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 py-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
