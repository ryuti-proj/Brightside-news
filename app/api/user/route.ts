import { NextResponse } from "next/server"
import { getCurrentPiUserIdFromHeaders } from "../../../lib/current-user"
import { getUserByPiUserId, upsertUser } from "../../../lib/user-data-store"

export async function GET() {
  try {
    const piUserId = await getCurrentPiUserIdFromHeaders()

    if (!piUserId) {
      return NextResponse.json(
        { ok: false, error: "Missing user identity header." },
        { status: 401 }
      )
    }

    const user = await getUserByPiUserId(piUserId)

    return NextResponse.json({
      ok: true,
      user,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load user." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const piUserId =
      typeof body?.piUserId === "string" && body.piUserId.trim()
        ? body.piUserId.trim()
        : null

    if (!piUserId) {
      return NextResponse.json(
        { ok: false, error: "piUserId is required." },
        { status: 400 }
      )
    }

    const user = await upsertUser({
      piUserId,
      username: typeof body?.username === "string" ? body.username : null,
      displayName: typeof body?.displayName === "string" ? body.displayName : null,
      avatarUrl: typeof body?.avatarUrl === "string" ? body.avatarUrl : null,
    })

    return NextResponse.json({
      ok: true,
      user,
    })
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to save user." },
      { status: 500 }
    )
  }
}