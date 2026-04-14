import { NextRequest, NextResponse } from "next/server"
import { getAdminRememberMeMaxAgeSeconds, getAdminSession, hasAdminSession } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = getAdminSession(request)

  return NextResponse.json({
    authenticated: hasAdminSession(request),
    persistent: session?.rememberMe ?? false,
    expiresAt: session ? new Date(session.expiresAt).toISOString() : null,
    rememberMeMaxAgeSeconds: getAdminRememberMeMaxAgeSeconds(),
  })
}
