import { NextResponse } from "next/server"
import { requireCurrentUser } from "../../../../lib/current-user"
import { isStorySaved, removeSavedStoryForUser } from "../../../../lib/user-data-store"

type RouteContext = {
  params: Promise<{
    storyId: string
  }>
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { user, error } = await requireCurrentUser()

    if (!user) {
      return NextResponse.json({ ok: false, error }, { status: 401 })
    }

    const params = await context.params
    const storyId = params.storyId

    if (!storyId) {
      return NextResponse.json(
        { ok: false, error: "storyId is required." },
        { status: 400 }
      )
    }

    const saved = await isStorySaved(user.id, storyId)

    return NextResponse.json({
      ok: true,
      saved,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to check saved story state." },
      { status: 500 }
    )
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { user, error } = await requireCurrentUser()

    if (!user) {
      return NextResponse.json({ ok: false, error }, { status: 401 })
    }

    const params = await context.params
    const storyId = params.storyId

    if (!storyId) {
      return NextResponse.json(
        { ok: false, error: "storyId is required." },
        { status: 400 }
      )
    }

    const removed = await removeSavedStoryForUser(user.id, storyId)

    return NextResponse.json({
      ok: true,
      removed,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to remove saved story." },
      { status: 500 }
    )
  }
}