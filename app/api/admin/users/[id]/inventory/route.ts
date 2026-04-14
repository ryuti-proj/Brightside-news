import { NextResponse } from "next/server"
import { getUserById } from "@/lib/user-data-store"
import { getUserInventorySummary } from "@/lib/inventory-store"

export const dynamic = "force-dynamic"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json({ error: "User id is required" }, { status: 400 })
    }

    const user = await getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const inventory = await getUserInventorySummary(user.id)

    return NextResponse.json({
      userId: user.id,
      inventory,
    })
  } catch (error) {
    console.error("[ADMIN USER INVENTORY] Exception:", error)
    return NextResponse.json({ error: "Failed to load user inventory" }, { status: 500 })
  }
}