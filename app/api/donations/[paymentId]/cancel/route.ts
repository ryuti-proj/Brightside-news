import { NextRequest, NextResponse } from "next/server"
import { upsertDonationRecord } from "@/lib/user-data-store"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await context.params
    const body = await request.json()

    const amount = Number(body?.amount)
    const memo = typeof body?.memo === "string" ? body.memo : "BrightSide News donation"
    const piUserId = typeof body?.piUserId === "string" ? body.piUserId : null
    const username = typeof body?.username === "string" ? body.username : null
    const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : null

    if (!paymentId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment cancellation request" }, { status: 400 })
    }

    const record = await upsertDonationRecord({
      paymentId,
      amount,
      memo,
      metadata,
      piUserId,
      username,
      status: "cancelled",
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel donation" },
      { status: 500 }
    )
  }
}
