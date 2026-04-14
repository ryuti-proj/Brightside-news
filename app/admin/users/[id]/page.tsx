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
  Sparkles,
  Award,
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
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "PU"
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
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-5 h-5 animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <Button asChild>
          <Link href="/admin">Back</Link>
        </Button>
        <p className="text-red-600 mt-4">{error}</p>
      </div>
    )
  }

  const { user, savedStories, donations, activity } = data

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/admin">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </Button>

      <Card>
        <CardContent className="p-6 flex gap-6">
          <Avatar className="w-20 h-20">
            <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{getUserLabel(user)}</h2>
            <p>Pi ID: {user.piUserId}</p>
            <p>Joined: {formatDate(user.createdAt)}</p>
            <p>Last Activity: {formatDate(activity.lastActivityAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* NEW: Avatar placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Avatar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Avatar system coming next (owned avatars, equipped avatar, marketplace).
          </p>
        </CardContent>
      </Card>

      {/* NEW: Badges placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-4 h-4" /> Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Badge system coming next (earned + purchased badges).
          </p>
        </CardContent>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activity.items.slice(0, 10).map((item) => (
            <div key={item.id} className="border p-3 rounded">
              <div className="flex justify-between">
                <span>{item.title}</span>
                <span className="text-xs">{formatDate(item.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Donations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {donations.map((d) => (
            <div key={d.id} className="border p-3 rounded">
              <div className="flex gap-2 items-center">
                <span>{formatPiAmount(d.amount)}</span>
                <Badge variant={getDonationStatusTone(d.status)}>
                  {d.status}
                </Badge>
              </div>
              <p className="text-xs">{formatDate(d.updatedAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Saved stories */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Stories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {savedStories.map((s) => (
            <div key={s.id} className="border p-3 rounded">
              <div className="flex justify-between">
                <span>{s.title}</span>
                {s.url && (
                  <a href={s.url} target="_blank">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-xs">{formatDate(s.savedAt)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}