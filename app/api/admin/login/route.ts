import { NextRequest, NextResponse } from "next/server"

const ADMIN_COOKIE_NAME = "brightside-admin-session"

function createSessionValue() {
  return Buffer.from(`${Date.now()}:${Math.random()}`).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = typeof body?.username === "string" ? body.username.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    console.log("[ADMIN LOGIN] Username entered:", username)
    console.log("[ADMIN LOGIN] ADMIN_USERNAME exists:", Boolean(adminUsername))
    console.log("[ADMIN LOGIN] ADMIN_PASSWORD exists:", Boolean(adminPassword))

    if (!adminUsername || !adminPassword) {
      return NextResponse.json({ error: "Admin credentials are not configured on the server." }, { status: 500 })
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: createSessionValue(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    })

    return response
  } catch (error) {
    console.error("[ADMIN LOGIN] Exception:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}