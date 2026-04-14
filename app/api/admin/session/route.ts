import { NextResponse } from "next/server"
import { getAdminTokenFromRequest } from "@/lib/admin-auth"

export async function GET(req: Request) {
  const token = getAdminTokenFromRequest(req)

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}