import { NextRequest, NextResponse } from "next/server"
import { getAdminSessionMaxAgeSeconds, isAdminAuthenticated } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  return NextResponse.json({
    authenticated: isAdminAuthenticated(request),
    persistent: true,
    maxAgeSeconds: getAdminSessionMaxAgeSeconds(true),
    expiresAt: null,
  })
}
