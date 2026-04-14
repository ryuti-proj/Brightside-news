"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RefreshCw, Search, Users, Bookmark, Heart, Coins, Calendar, UserRound, ArrowRight } from "lucide-react"
import { formatPiAmount } from "@/lib/donation-settings"
import { getAdminToken } from "@/lib/admin-client"

type AdminUser = {
  id: string
  piUserId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
  savedCount: number
  donationCount: number
  completedDonationCount: number
  completedDonationTotal: number
  lastDonationAt: string | null
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function getUserLabel(user: AdminUser) {
  return user.displayName || user.username || "Pi user"
}

function getUserInitials(user: AdminUser) {
  const label = getUserLabel(user).trim()
  if (!label) return "PU"

  const parts = label.split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "PU"
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadUsers = async () => {
    setIsLoading(true)
    setError("")

    try {
      const token = getAdminToken()

      const response = await fetch("/api/admin/users", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "x-admin-token": token || "",
        },
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load users")
      }

      setUsers(Array.isArray(data?.users) ? data.users : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return users

    return users.filter((user) => {
      const haystack = [user.displayName, user.username, user.piUserId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [searchQuery, users])

  const totalUsers = users.length
  const totalSavedStories = users.reduce((sum, user) => sum + user.savedCount, 0)
  const totalCompletedDonations = users.reduce((sum, user) => sum + user.completedDonationCount, 0)
  const totalPiRaised = users.reduce((sum, user) => sum + user.completedDonationTotal, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Users</h2>
          <p className="text-gray-600">Live user records from Pi sign-ins, saved stories, and donation activity.</p>
        </div>
        <Button variant="outline" onClick={() => void loadUsers()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Stories</p>
                <p className="text-2xl font-bold">{totalSavedStories}</p>
              </div>
              <Bookmark className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Donations</p>
                <p className="text-2xl font-bold">{totalCompletedDonations}</p>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pi Raised</p>
                <p className="text-2xl font-bold">{formatPiAmount(totalPiRaised)}</p>
              </div>
              <Coins className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, username or Pi user ID"
              className="pl-9"
            />
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}

          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No users found</p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <Avatar className="w-12 h-12 shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700">{getUserInitials(user)}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{getUserLabel(user)}</h3>
                          {user.completedDonationCount > 0 && <Badge variant="default">Donor</Badge>}
                          {user.savedCount > 0 && <Badge variant="secondary">Saved stories</Badge>}
                        </div>

                        <div className="space-y-1 text-sm text-gray-600 break-all">
                          <div className="flex items-center gap-2">
                            <UserRound className="w-4 h-4 shrink-0" />
                            <span>@{user.username || "unknown"}</span>
                          </div>
                          <p>Pi User ID: {user.piUserId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="rounded-md border bg-white p-3">
                        <p className="text-xs text-gray-500 mb-1">Saved</p>
                        <p className="font-semibold text-gray-900">{user.savedCount}</p>
                      </div>
                      <div className="rounded-md border bg-white p-3">
                        <p className="text-xs text-gray-500 mb-1">Donations</p>
                        <p className="font-semibold text-gray-900">{user.completedDonationCount}</p>
                      </div>
                      <div className="rounded-md border bg-white p-3">
                        <p className="text-xs text-gray-500 mb-1">Pi given</p>
                        <p className="font-semibold text-gray-900">{formatPiAmount(user.completedDonationTotal)}</p>
                      </div>
                      <div className="rounded-md border bg-white p-3">
                        <p className="text-xs text-gray-500 mb-1">Joined</p>
                        <p className="font-semibold text-gray-900 text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm text-gray-600 flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>Last profile update: {formatDate(user.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 shrink-0" />
                        <span>Last donation: {formatDate(user.lastDonationAt)}</span>
                      </div>
                    </div>

                    <Button variant="outline" asChild>
                      <Link href={`/admin/users/${user.id}`}>
                        View details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}