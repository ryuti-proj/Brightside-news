import { NextRequest, NextResponse } from "next/server"
import { getUserByPiUserId, getSavedStoriesByUserId, saveStoryForUser } from "@/lib/user-data-store"

export async function GET(request: NextRequest) {
  try {
    const piUserId = request.headers.get("x-pi-user-id")

    if (!piUserId) {
      return NextResponse.json({ error: "Missing user" }, { status: 401 })
    }

    const user = await getUserByPiUserId(piUserId)

    if (!user) {
      return NextResponse.json({ stories: [] })
    }

    const stories = await getSavedStoriesByUserId(user.id)

    return NextResponse.json({ stories })
  } catch (error) {
    console.error("GET /api/saved-stories failed:", error)
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const piUserId = request.headers.get("x-pi-user-id")

    if (!piUserId) {
      return NextResponse.json({ error: "Missing user" }, { status: 401 })
    }

    const body = await request.json()

    const user = await getUserByPiUserId(piUserId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const story = await saveStoryForUser(user.id, body)

    return NextResponse.json({ story })
  } catch (error) {
    console.error("POST /api/saved-stories failed:", error)
    return NextResponse.json({ error: "Failed to save story" }, { status: 500 })
  }
}