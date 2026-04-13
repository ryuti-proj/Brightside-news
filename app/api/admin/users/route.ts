import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

type UserDetailRow = {
  id: string
  pi_user_id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string | Date
  updated_at: string | Date
  saved_count: string | number | null
  donation_count: string | number | null
  completed_donation_count: string | number | null
  completed_donation_total: string | number | null
  last_saved_at: string | Date | null
  last_donation_at: string | Date | null
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

    const userResult = await query<UserDetailRow>(
      `
        SELECT
          u.id,
          u.pi_user_id,
          u.username,
          u.display_name,
          u.avatar_url,
          u.created_at,
          u.updated_at,
          COALESCE(saved.saved_count, 0) AS saved_count,
          COALESCE(donations.donation_count, 0) AS donation_count,
          COALESCE(donations.completed_donation_count, 0) AS completed_donation_count,
          COALESCE(donations.completed_donation_total, 0) AS completed_donation_total,
          saved.last_saved_at,
          donations.last_donation_at
        FROM users u
        LEFT JOIN (
          SELECT user_id, COUNT(*) AS saved_count, MAX(saved_at) AS last_saved_at
          FROM saved_stories
          GROUP BY user_id
        ) saved ON saved.user_id = u.id
        LEFT JOIN (
          SELECT
            pi_user_id,
            COUNT(*) AS donation_count,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed_donation_count,
            COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS completed_donation_total,
            MAX(updated_at) AS last_donation_at
          FROM donations
          WHERE pi_user_id IS NOT NULL
          GROUP BY pi_user_id
        ) donations ON donations.pi_user_id = u.pi_user_id
        WHERE u.id = $1
        LIMIT 1
      `,
      [id]
    )

    const userRow = userResult.rows[0]

    if (!userRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const [savedStoriesResult, donationsResult] = await Promise.all([
      query<SavedStoryRow>(
        `
          SELECT id, user_id, story_id, title, summary, image_url, source, url, published_at, category, saved_at
          FROM saved_stories
          WHERE user_id = $1
          ORDER BY saved_at DESC
        `,
        [id]
      ),
      query<DonationRow>(
        `
          SELECT id, payment_id, txid, pi_user_id, username, amount, currency, memo, metadata, status, created_at, updated_at
          FROM donations
          WHERE pi_user_id = $1
          ORDER BY updated_at DESC, created_at DESC
        `,
        [userRow.pi_user_id]
      ),
    ])

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

    const user = {
      id: userRow.id,
      piUserId: userRow.pi_user_id,
      username: userRow.username,
      displayName: userRow.display_name,
      avatarUrl: userRow.avatar_url,
      createdAt: new Date(userRow.created_at).toISOString(),
      updatedAt: new Date(userRow.updated_at).toISOString(),
      savedCount: Number(userRow.saved_count ?? 0),
      donationCount: Number(userRow.donation_count ?? 0),
      completedDonationCount: Number(userRow.completed_donation_count ?? 0),
      completedDonationTotal: Number(userRow.completed_donation_total ?? 0),
      lastSavedAt: toIso(userRow.last_saved_at),
      lastDonationAt: toIso(userRow.last_donation_at),
    }

    return NextResponse.json({
      user,
      savedStories,
      donations,
      activity: {
        totalItems: recentActivity.length,
        lastActivityAt: recentActivity[0]?.timestamp ?? null,
        counts: {
          savedStories: savedStories.length,
          donations: donations.length,
          completedDonations: donations.filter((donation) => donation.status === "completed").length,
        },
        items: recentActivity,
      },
    })
  } catch (error) {
    console.error("[ADMIN USER DETAIL] Exception:", error)
    return NextResponse.json({ error: "Failed to load admin user detail" }, { status: 500 })
  }
}