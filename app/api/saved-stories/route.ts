import { NextRequest, NextResponse } from "next/server"
import {
  getSavedStoriesByUserId,
  removeSavedStoryForUser,
  saveStoryForUser,
} from "@/lib/user-data-store"

function normalize(value: string | null | undefined) {
  return (value || "").trim()
}

function normalizeLower(value: string | null | undefined) {
  return normalize(value).toLowerCase()
}

function buildSavedStoryId(story: {
  storyId?: string | null
  title?: string | null
  source?: string | null
  url?: string | null
  category?: string | null
}) {
  const normalizedUrl = normalizeLower(story.url)
  const normalizedTitle = normalizeLower(story.title)
  const normalizedSource = normalizeLower(story.source)
  const normalizedCategory = normalizeLower(story.category)

  if (normalizedUrl) {
    return `url:${normalizedUrl}`
  }

  return `meta:${normalizedTitle}|${normalizedSource}|${normalizedCategory}`
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const piUserId = normalize(searchParams.get("piUserId"))

    if (!piUserId) {
      return NextResponse.json({ error: "Missing piUserId" }, { status: 400 })
    }

    const savedStories = await getSavedStoriesByUserId(piUserId)

    return NextResponse.json(savedStories)
  } catch (error) {
    console.error("GET /api/saved-stories failed:", error)
    return NextResponse.json({ error: "Failed to fetch saved stories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const piUserId = normalize(body?.piUserId)
    const story = body?.story

    if (!piUserId || !story) {
      return NextResponse.json({ error: "Missing piUserId or story" }, { status: 400 })
    }

    const savedStory = await saveStoryForUser(piUserId, {
      ...story,
      storyId: buildSavedStoryId(story),
    })

    return NextResponse.json(savedStory)
  } catch (error) {
    console.error("POST /api/saved-stories failed:", error)
    return NextResponse.json({ error: "Failed to save story" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const piUserId = normalize(body?.piUserId)

    if (!piUserId) {
      return NextResponse.json({ error: "Missing piUserId" }, { status: 400 })
    }

    const storyId = normalize(body?.storyId) || buildSavedStoryId(body ?? {})

    if (!storyId) {
      return NextResponse.json({ error: "Missing story identifier" }, { status: 400 })
    }

    const removed = await removeSavedStoryForUser(piUserId, storyId)

    return NextResponse.json({ success: removed })
  } catch (error) {
    console.error("DELETE /api/saved-stories failed:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
  }
}