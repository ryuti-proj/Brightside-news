import { NextRequest, NextResponse } from "next/server"

const ADMIN_COOKIE_NAME = "brightside-admin-session"

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)

  return NextResponse.json({
    authenticated: Boolean(cookie?.value),
  })
}
