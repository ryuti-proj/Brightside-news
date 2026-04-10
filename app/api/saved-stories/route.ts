import { NextResponse } from "next/server"
import { requireCurrentUser } from "../../../lib/current-user"
import { getSavedStoriesByUserId, saveStoryForUser } from "../../../lib/user-data-store"

export async function GET() {
  try {
    const { user, error } = await requireCurrentUser()

    if (!user) {
      return NextResponse.json({ ok: false, error }, { status: 401 })
    }

    const savedStories = await getSavedStoriesByUserId(user.id)

    return NextResponse.json({
      ok: true,
      savedStories,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load saved stories." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireCurrentUser()

    if (!user) {
      return NextResponse.json({ ok: false, error }, { status: 401 })
    }

    const body = await request.json()

    const storyId =
      typeof body?.storyId === "string" && body.storyId.trim()
        ? body.storyId.trim()
        : null

    const title =
      typeof body?.title === "string" && body.title.trim()
        ? body.title.trim()
        : null

    if (!storyId || !title) {
      return NextResponse.json(
        { ok: false, error: "storyId and title are required." },
        { status: 400 }
      )
    }

    const savedStory = await saveStoryForUser(user.id, {
      storyId,
      title,
      summary: typeof body?.summary === "string" ? body.summary : null,
      imageUrl: typeof body?.imageUrl === "string" ? body.imageUrl : null,
      source: typeof body?.source === "string" ? body.source : null,
      url: typeof body?.url === "string" ? body.url : null,
      publishedAt: typeof body?.publishedAt === "string" ? body.publishedAt : null,
      category: typeof body?.category === "string" ? body.category : null,
    })

    return NextResponse.json({
      ok: true,
      savedStory,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to save story." },
      { status: 500 }
    )
  }
}