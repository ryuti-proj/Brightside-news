"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { BackupPanel } from "@/components/backup-panel"
import { AdminDonations } from "@/components/admin-donations"
import { AdminSecurity } from "@/components/admin-security"
import { AdminStories } from "@/components/admin-stories"
import { AdminUsers } from "@/components/admin-users"
import { AdminComments } from "@/components/admin-comments"
import { AdminCategories } from "@/components/admin-categories"
import { AdminDashboardStats } from "@/components/admin-dashboard-stats"
import { AdminFeaturedCategories } from "@/components/admin-featured-categories"
import {
  Shield,
  Eye,
  EyeOff,
  BarChart3,
  FileText,
  Users,
  Clock,
  Heart,
  Tag,
  Database,
  MessageSquare,
  Star,
} from "lucide-react"

// Login Component
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (username === "admin" && password === "brightside2024!") {
        localStorage.setItem("brightside-admin-auth", "true")
        localStorage.setItem("brightside-admin-time", Date.now().toString())
        onLogin()
      } else {
        setError("Invalid credentials")
      }
    } catch (error) {
      setError("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">BrightSide Admin</CardTitle>
          <p className="text-gray-600">Administration Panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !username || !password}
            >
              {isLoading ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-800 mb-2">Demo Credentials:</p>
            <div className="text-sm text-blue-700">
              <p>
                <strong>Username:</strong> admin
              </p>
              <p>
                <strong>Password:</strong> brightside2024!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Admin Dashboard
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStatus = localStorage.getItem("brightside-admin-auth")
        const authTime = localStorage.getItem("brightside-admin-time")

        if (authStatus === "true" && authTime) {
          const loginTime = Number.parseInt(authTime)
          const currentTime = Date.now()
          const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours

          if (currentTime - loginTime < sessionDuration) {
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem("brightside-admin-auth")
            localStorage.removeItem("brightside-admin-time")
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = () => {
    localStorage.removeItem("brightside-admin-auth")
    localStorage.removeItem("brightside-admin-time")
    setIsAuthenticated(false)
  }

  const goHome = () => {
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your BrightSide News platform</p>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white border border-gray-200">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </Button>
            <Button
              variant={activeTab === "stories" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("stories")}
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Stories</span>
            </Button>
            <Button
              variant={activeTab === "categories" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("categories")}
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Categories</span>
            </Button>
            <Button
              variant={activeTab === "featured" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("featured")}
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Featured</span>
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("users")}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </Button>
            <Button
              variant={activeTab === "comments" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("comments")}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Comments</span>
            </Button>
            <Button
              variant={activeTab === "donations" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("donations")}
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Donations</span>
            </Button>
            <Button
              variant={activeTab === "backup" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("backup")}
            >
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Backup</span>
            </Button>
            <Button
              variant={activeTab === "security" ? "default" : "ghost"}
              className="flex items-center gap-2"
              onClick={() => setActiveTab("security")}
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </Button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <div>
                <AdminDashboardStats />
              </div>
            )}

            {activeTab === "stories" && <AdminStories />}

            {activeTab === "categories" && <AdminCategories />}

            {activeTab === "featured" && <AdminFeaturedCategories />}

            {activeTab === "users" && <AdminUsers />}

            {activeTab === "comments" && <AdminComments />}

            {activeTab === "donations" && <AdminDonations />}

            {activeTab === "backup" && (
              <div>
                <BackupPanel />
              </div>
            )}

            {activeTab === "security" && <AdminSecurity />}
          </div>
        </div>
      </div>
    </div>
  )
}
