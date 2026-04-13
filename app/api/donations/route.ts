import { NextRequest, NextResponse } from "next/server"
import { getDonationRecords } from "@/lib/user-data-store"

const ADMIN_COOKIE_NAME = "brightside-admin-session"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)

    if (!cookie?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const records = await getDonationRecords()
    return NextResponse.json({ records }, { status: 200 })
  } catch (error) {
    console.error("[DONATIONS GET] Exception:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load donations" },
      { status: 500 }
    )
  }
}
