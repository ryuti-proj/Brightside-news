"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Bookmark,
  Calendar,
  ExternalLink,
  RefreshCw,
  UserRound,
  Clock3,
  Activity,
} from "lucide-react"
import { formatPiAmount, getDonationStatusTone } from "@/lib/donation-settings"
import type { DonationRecord, SavedStory } from "@/types/user-data"

type UserDetail = {
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
  lastSavedAt: string | null
  lastDonationAt: string | null
}

type ActivityItem = {
  id: string
  type: "saved_story" | "donation"
  title: string
  description: string
  timestamp: string
}

type UserDetailResponse = {
  user: UserDetail
  savedStories: SavedStory[]
  donations: DonationRecord[]
  activity: {
    totalItems: number
    lastActivityAt: string | null
    counts: {
      savedStories: number
      donations: number
      completedDonations: number
    }
    items: ActivityItem[]
  }
}

function formatDate(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

function getUserLabel(user: UserDetail) {
  return user.displayName || user.username || "Pi user"
}

function getUserInitials(user: UserDetail) {
  const label = getUserLabel(user).trim()
  if (!label) return "PU"

  const parts = label.split(/\s+/).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "PU"
}

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>()
  const userId = typeof params?.id === "string" ? params.id : ""

  const [data, setData] = useState<UserDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadUser = async () => {
    if (!userId) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load user detail")
      }

      setData(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load user detail")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadUser()
  }, [userId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading user detail...</span>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Button variant="ghost" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to admin
            </Link>
          </Button>
          <Card>
            <CardContent className="p-6">
              <p className="text-red-600">{error || "User detail could not be loaded."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { user, savedStories, donations, activity } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 truncate">{getUserLabel(user)}</h1>
              <p className="text-gray-600 break-all">Pi User ID: {user.piUserId}</p>
            </div>
          </div>

          <Button variant="outline" onClick={() => void loadUser()} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
              <Avatar className="w-20 h-20 shrink-0">
                <AvatarFallback className="bg-blue-100 text-blue-700 text-xl">
                  {getUserInitials(user)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-4 min-w-0 flex-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{getUserLabel(user)}</h2>
                    {user.completedDonationCount > 0 && <Badge variant="default">Donor</Badge>}
                    {user.savedCount > 0 && <Badge variant="secondary">Saved stories</Badge>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 break-all">
                    <div className="flex items-center gap-2">
                      <UserRound className="w-4 h-4 shrink-0" />
                      <span>@{user.username || "unknown"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Joined: {formatDate(user.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="w-4 h-4 shrink-0" />
                      <span>Profile updated: {formatDate(user.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 shrink-0" />
                      <span>Last activity: {formatDate(activity.lastActivityAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  <div className="rounded-md border bg-white p-3">
                    <p className="text-xs text-gray-500 mb-1">Saved stories</p>
                    <p className="font-semibold text-gray-900">{user.savedCount}</p>
                  </div>
                  <div className="rounded-md border bg-white p-3">
                    <p className="text-xs text-gray-500 mb-1">Donations</p>
                    <p className="font-semibold text-gray-900">{user.donationCount}</p>
                  </div>
                  <div className="rounded-md border bg-white p-3">
                    <p className="text-xs text-gray-500 mb-1">Completed Pi</p>
                    <p className="font-semibold text-gray-900">{formatPiAmount(user.completedDonationTotal)}</p>
                  </div>
                  <div className="rounded-md border bg-white p-3">
                    <p className="text-xs text-gray-500 mb-1">Recent activity items</p>
                    <p className="font-semibold text-gray-900">{activity.totalItems}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-1">
            <CardHeader>
              <CardTitle>Activity-ready summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center justify-between rounded-md border bg-white p-3">
                <span>Saved story events</span>
                <span className="font-semibold">{activity.counts.savedStories}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-white p-3">
                <span>Donation events</span>
                <span className="font-semibold">{activity.counts.donations}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border bg-white p-3">
                <span>Completed donations</span>
                <span className="font-semibold">{activity.counts.completedDonations}</span>
              </div>
              <div className="rounded-md border bg-blue-50 p-3 text-blue-900">
                This structure is ready to grow into user activity feeds, avatars, badges, and moderation history.
              </div>
            </CardContent>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.items.length === 0 ? (
                <p className="text-sm text-gray-500">No activity recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {activity.items.slice(0, 12).map((item) => (
                    <div key={item.id} className="rounded-lg border bg-gray-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-semibold text-gray-900">{item.title}</p>
                            <Badge variant={item.type === "donation" ? "default" : "secondary"}>
                              {item.type === "donation" ? "Donation" : "Saved story"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <p className="text-xs text-gray-500 whitespace-nowrap">{formatDate(item.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Donation history</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="text-sm text-gray-500">No Pi donations recorded for this user yet.</p>
            ) : (
              <div className="space-y-3">
                {donations.map((donation) => (
                  <div key={donation.id} className="rounded-lg border bg-gray-50 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{formatPiAmount(donation.amount)}</p>
                          <Badge variant={getDonationStatusTone(donation.status)}>{donation.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 break-all">Payment ID: {donation.paymentId}</p>
                        <p className="text-sm text-gray-600 break-all">TXID: {donation.txid || "—"}</p>
                        <p className="text-sm text-gray-600">Memo: {donation.memo}</p>
                      </div>
                      <div className="text-sm text-gray-600 lg:text-right">
                        <p>Created: {formatDate(donation.createdAt)}</p>
                        <p>Updated: {formatDate(donation.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved stories</CardTitle>
          </CardHeader>
          <CardContent>
            {savedStories.length === 0 ? (
              <p className="text-sm text-gray-500">This user has not saved any stories yet.</p>
            ) : (
              <div className="space-y-3">
                {savedStories.map((story) => (
                  <div key={story.id} className="rounded-lg border bg-gray-50 p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{story.title}</p>
                          <Badge variant="secondary">
                            <Bookmark className="w-3 h-3 mr-1" />
                            Saved
                          </Badge>
                          {story.category && <Badge variant="outline">{story.category}</Badge>}
                        </div>
                        {story.summary && <p className="text-sm text-gray-600">{story.summary}</p>}
                        <div className="text-sm text-gray-600 space-y-1 break-all">
                          <p>Source: {story.source || "—"}</p>
                          <p>Published: {formatDate(story.publishedAt)}</p>
                          <p>Saved: {formatDate(story.savedAt)}</p>
                        </div>
                      </div>
                      {story.url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={story.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open story
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}