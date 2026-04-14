import { NextResponse } from "next/server"

export function getAdminTokenFromRequest(req: Request) {
  return req.headers.get("x-admin-token") || null
}

export function requireAdminRequest(req: Request) {
  const token = getAdminTokenFromRequest(req)

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set("admin_session", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    maxAge: 0,
  })

  return response
}