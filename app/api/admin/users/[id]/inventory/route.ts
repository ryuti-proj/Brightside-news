import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserInventorySummary } from "@/lib/inventory-store"
import { requireAdminRequest } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

type UserRow = {
  id: string
  pi_user_id: string
  username: string | null
}

async function resolveUser(identifier: string) {
  const normalized = identifier.trim()
  const usernameCandidate = normalized.startsWith("@") ? normalized.slice(1) : normalized

  const result = await query<UserRow>(
    `
      SELECT id, pi_user_id, username
      FROM users
      WHERE id = $1
         OR pi_user_id = $1
         OR LOWER(COALESCE(username, '')) = LOWER($2)
      LIMIT 1
    `,
    [normalized, usernameCandidate]
  )

  return result.rows[0] ?? null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const unauthorized = requireAdminRequest(request)
  if (unauthorized) return unauthorized

  try {
    const identifier = params.id

    if (!identifier) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 })
    }

    const user = await resolveUser(identifier)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const inventory = await getUserInventorySummary(user.id)

    return NextResponse.json({
      userId: user.id,
      piUserId: user.pi_user_id,
      username: user.username,
      inventory,
    })
  } catch (error) {
    console.error("[ADMIN USER INVENTORY] Exception:", error)
    return NextResponse.json({ error: "Failed to load user inventory" }, { status: 500 })
  }
}
