import { NextRequest, NextResponse } from "next/server"
import { BACKEND_URLS } from "@/lib/system-config"

const PI_BACKEND_SESSION_COOKIE = "brightside-pi-backend-session"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = body?.pi_auth_token
    const appId = body?.app_id

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing pi_auth_token" }, { status: 400 })
    }

    const payload: Record<string, unknown> = {
      pi_auth_token: token,
    }

    if (typeof appId === "string" && appId.trim()) {
      payload.app_id = appId
    }

    const backendResponse = await fetch(BACKEND_URLS.LOGIN_PREVIEW, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    const backendText = await backendResponse.text()
    let backendData: unknown = null

    try {
      backendData = backendText ? JSON.parse(backendText) : null
    } catch {
      backendData = backendText
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error:
            typeof backendData === "object" && backendData && "error" in backendData
              ? (backendData as { error?: string }).error || "Backend preview login failed"
              : "Backend preview login failed",
        },
        { status: backendResponse.status }
      )
    }

    const setCookieHeader = backendResponse.headers.get("set-cookie")

    const response = NextResponse.json(backendData)

    if (setCookieHeader) {
      response.cookies.set({
        name: PI_BACKEND_SESSION_COOKIE,
        value: encodeURIComponent(setCookieHeader),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      })
    }

    return response
  } catch (error) {
    console.error("Pi preview login route failed:", error)
    return NextResponse.json({ error: "Pi preview login route failed" }, { status: 500 })
  }
}