import { headers } from "next/headers"
import { getUserByPiUserId } from "@/lib/user-data-store"

export async function getCurrentPiUserIdFromHeaders() {
  const headerStore = await headers()

  const piUserId =
    headerStore.get("x-pi-user-id") ||
    headerStore.get("x-user-id") ||
    headerStore.get("x-brightside-user-id")

  if (!piUserId) return null

  return piUserId.trim()
}

export async function requireCurrentUser() {
  const piUserId = await getCurrentPiUserIdFromHeaders()

  if (!piUserId) {
    return { user: null, error: "Missing user identity header." }
  }

  const user = await getUserByPiUserId(piUserId)

  if (!user) {
    return { user: null, error: "User not found." }
  }

  return { user, error: null }
}