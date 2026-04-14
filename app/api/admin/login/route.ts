import { NextRequest, NextResponse } from "next/server"
import { applyAdminSessionCookie, getAdminSessionMaxAgeSeconds } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const username = typeof body?.username === "string" ? body.username.trim() : ""
    const password = typeof body?.password === "string" ? body.password : ""

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      return NextResponse.json({ error: "Admin credentials are not configured on the server." }, { status: 500 })
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const response = NextResponse.json({
      success: true,
      persistent: true,
      maxAgeSeconds: getAdminSessionMaxAgeSeconds(),
    })

    return applyAdminSessionCookie(response)
  } catch (error) {
    console.error("[ADMIN LOGIN] Exception:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}