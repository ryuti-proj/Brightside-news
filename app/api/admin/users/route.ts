import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export const dynamic = "force-dynamic"

type AdminUserRow = {
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
  last_donation_at: string | Date | null
}

export async function GET() {
  try {
    const result = await query<AdminUserRow>(`
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
        donations.last_donation_at
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS saved_count
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
      ORDER BY u.updated_at DESC, u.created_at DESC
    `)

    const users = result.rows.map((row) => ({
      id: row.id,
      piUserId: row.pi_user_id,
      username: row.username,
      displayName: row.display_name,
      avatarUrl: row.avatar_url,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      savedCount: Number(row.saved_count ?? 0),
      donationCount: Number(row.donation_count ?? 0),
      completedDonationCount: Number(row.completed_donation_count ?? 0),
      completedDonationTotal: Number(row.completed_donation_total ?? 0),
      lastDonationAt: row.last_donation_at ? new Date(row.last_donation_at).toISOString() : null,
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[ADMIN USERS] Exception:", error)
    return NextResponse.json({ error: "Failed to load admin users" }, { status: 500 })
  }
}