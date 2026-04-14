import { NextResponse } from "next/server"
import { getAvatarCatalog } from "@/lib/inventory-store"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const avatars = await getAvatarCatalog()

    return NextResponse.json({
      avatars,
      count: avatars.length,
    })
  } catch (error) {
    console.error("[AVATAR CATALOG] Exception:", error)
    return NextResponse.json({ error: "Failed to load avatar catalog" }, { status: 500 })
  }
}