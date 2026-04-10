import { headers } from "next/headers"
import { getUserByPiUserId, upsertUser } from "@/lib/user-data-store"

function normalizePiUserId(value: unknown): string | null {
  if (typeof value !== "string") return null

  const trimmed = value.trim()

  if (!trimmed) return null

  if (/^pi-[^\s]+$/i.test(trimmed)) {
    return trimmed.replace(/^pi-/i, "")
  }

  return trimmed
}

export async function getCurrentPiUserIdFromHeaders() {
  const headerStore = await headers()

  const piUserId =
    headerStore.get("x-pi-user-id") ||
    headerStore.get("x-user-id") ||
    headerStore.get("x-brightside-user-id")

  return normalizePiUserId(piUserId)
}

export async function requireCurrentUser() {
  const piUserId = await getCurrentPiUserIdFromHeaders()

  if (!piUserId) {
    return { user: null, error: "Missing user identity header." }
  }

  const existingUser = await getUserByPiUserId(piUserId)

  if (existingUser) {
    return { user: existingUser, error: null }
  }

  const user = await upsertUser({
    piUserId,
    username: null,
    displayName: null,
    avatarUrl: null,
  })

  return { user, error: null }
}