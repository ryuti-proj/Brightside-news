import { NextRequest, NextResponse } from "next/server"
import { getAdminSession, getAdminSessionMaxAgeSeconds, isAdminAuthenticated } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const session = getAdminSession(request)

  return NextResponse.json({
    authenticated: isAdminAuthenticated(request),
    persistent: true,
    maxAgeSeconds: getAdminSessionMaxAgeSeconds(),
    expiresAt: session ? new Date(session.expiresAt).toISOString() : null,
  })
}