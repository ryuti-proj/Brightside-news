import { NextResponse } from "next/server"
import { getBadgeCatalog } from "@/lib/inventory-store"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const badges = await getBadgeCatalog()

    return NextResponse.json({
      badges,
      count: badges.length,
    })
  } catch (error) {
    console.error("[BADGE CATALOG] Exception:", error)
    return NextResponse.json({ error: "Failed to load badge catalog" }, { status: 500 })
  }
}