import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

type UserRow = {
  id: string
  pi_user_id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string | Date
  updated_at: string | Date
}

type SavedStoryRow = {
  id: string
  user_id: string
  story_id: string
  title: string
  summary: string | null
  image_url: string | null
  source: string | null
  url: string | null
  published_at: string | Date | null
  category: string | null
  saved_at: string | Date
}

type DonationRow = {
  id: string
  payment_id: string
  txid: string | null
  pi_user_id: string | null
  username: string | null
  amount: string | number
  currency: string
  memo: string
  metadata: Record<string, unknown> | null
  status: "pending" | "approved" | "completed" | "cancelled" | "failed"
  created_at: string | Date
  updated_at: string | Date
}

function toIso(value: string | Date | null | undefined) {
  if (!value) return null
  return new Date(value).toISOString()
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 })
    }

    const userResult = await query<UserRow>(
      `
        SELECT
          id,
          pi_user_id,
          username,
          display_name,
          avatar_url,
          created_at,
          updated_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    )

    const userRow = userResult.rows[0]

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const savedStoriesResult = await query<SavedStoryRow>(
      `
        SELECT
          id,
          user_id,
          story_id,
          title,
          summary,
          image_url,
          source,
          url,
          published_at,
          category,
          saved_at
        FROM saved_stories
        WHERE user_id = $1
        ORDER BY saved_at DESC
      `,
      [userRow.id]
    )

    const donationsResult = await query<DonationRow>(
      `
        SELECT
          id,
          payment_id,
          txid,
          pi_user_id,
          username,
          amount,
          currency,
          memo,
          metadata,
          status,
          created_at,
          updated_at
        FROM donations
        WHERE pi_user_id = $1
        ORDER BY updated_at DESC, created_at DESC
      `,
      [userRow.pi_user_id]
    )

    const savedStories = savedStoriesResult.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      storyId: row.story_id,
      title: row.title,
      summary: row.summary,
      imageUrl: row.image_url,
      source: row.source,
      url: row.url,
      publishedAt: toIso(row.published_at),
      category: row.category,
      savedAt: new Date(row.saved_at).toISOString(),
    }))

    const donations = donationsResult.rows.map((row) => ({
      id: row.id,
      paymentId: row.payment_id,
      txid: row.txid,
      piUserId: row.pi_user_id,
      username: row.username,
      amount: Number(row.amount),
      currency: row.currency,
      memo: row.memo,
      metadata: row.metadata,
      status: row.status,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }))

    const completedDonations = donations.filter((donation) => donation.status === "completed")
    const completedDonationTotal = completedDonations.reduce((sum, donation) => sum + donation.amount, 0)

    const recentActivity = [
      ...savedStories.map((story) => ({
        id: `saved-${story.id}`,
        type: "saved_story" as const,
        title: story.title,
        description: story.source || story.category || "Saved story",
        timestamp: story.savedAt,
      })),
      ...donations.map((donation) => ({
        id: `donation-${donation.id}`,
        type: "donation" as const,
        title: `${donation.amount} π donation`,
        description: `${donation.status} • ${donation.memo}`,
        timestamp: donation.updatedAt,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      user: {
        id: userRow.id,
        piUserId: userRow.pi_user_id,
        username: userRow.username,
        displayName: userRow.display_name,
        avatarUrl: userRow.avatar_url,
        createdAt: new Date(userRow.created_at).toISOString(),
        updatedAt: new Date(userRow.updated_at).toISOString(),
        savedCount: savedStories.length,
        donationCount: donations.length,
        completedDonationCount: completedDonations.length,
        completedDonationTotal,
        lastSavedAt: savedStories[0]?.savedAt ?? null,
        lastDonationAt: donations[0]?.updatedAt ?? null,
      },
      savedStories,
      donations,
      activity: {
        totalItems: recentActivity.length,
        lastActivityAt: recentActivity[0]?.timestamp ?? null,
        counts: {
          savedStories: savedStories.length,
          donations: donations.length,
          completedDonations: completedDonations.length,
        },
        items: recentActivity,
      },
    })
  } catch (error) {
    console.error("[ADMIN USER DETAIL] Exception:", error)
    return NextResponse.json({ error: "Failed to load admin user detail" }, { status: 500 })
  }
}