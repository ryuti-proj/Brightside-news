"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  Loader2,
} from "lucide-react"

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
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error || "Invalid credentials")
        return
      }

      onLogin()
    } catch {
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
          <p className="text-gray-600">Secure administration panel</p>
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
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        const data = await response.json().catch(() => null)
        setIsAuthenticated(Boolean(data?.authenticated))
      } catch {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    void checkAuth()
  }, [])

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => null)

    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Checking admin session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">BrightSide Admin</h1>
              <p className="text-gray-600">Manage content, users, security, and Pi donations</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button variant={activeTab === "overview" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("overview")}>
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </Button>
            <Button variant={activeTab === "stories" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("stories")}>
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Stories</span>
            </Button>
            <Button variant={activeTab === "categories" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("categories")}>
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Categories</span>
            </Button>
            <Button variant={activeTab === "featured" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("featured")}>
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Featured</span>
            </Button>
            <Button variant={activeTab === "users" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("users")}>
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </Button>
            <Button variant={activeTab === "comments" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("comments")}>
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Comments</span>
            </Button>
            <Button variant={activeTab === "donations" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("donations")}>
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Donations</span>
            </Button>
            <Button variant={activeTab === "backup" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("backup")}>
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Backup</span>
            </Button>
            <Button variant={activeTab === "security" ? "default" : "ghost"} className="flex items-center gap-2" onClick={() => setActiveTab("security")}>
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </Button>
          </div>

          <div className="space-y-6">
            {activeTab === "overview" && <AdminDashboardStats />}
            {activeTab === "stories" && <AdminStories />}
            {activeTab === "categories" && <AdminCategories />}
            {activeTab === "featured" && <AdminFeaturedCategories />}
            {activeTab === "users" && <AdminUsers />}
            {activeTab === "comments" && <AdminComments />}
            {activeTab === "donations" && <AdminDonations />}
            {activeTab === "backup" && <BackupPanel />}
            {activeTab === "security" && <AdminSecurity />}
          </div>
        </div>
      </div>
    </div>
  )
}
