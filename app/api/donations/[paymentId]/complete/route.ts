import { NextRequest, NextResponse } from "next/server"
import { BACKEND_URLS } from "@/lib/system-config"
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
    const txid = typeof body?.txid === "string" ? body.txid : null
    const piUserId = typeof body?.piUserId === "string" ? body.piUserId : null
    const username = typeof body?.username === "string" ? body.username : null
    const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : null

    if (!paymentId || !txid || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment completion request" }, { status: 400 })
    }

    const completeResponse = await fetch(BACKEND_URLS.COMPLETE_PAYMENT(paymentId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    })

    if (!completeResponse.ok) {
      const errorText = await completeResponse.text().catch(() => "")

      await upsertDonationRecord({
        paymentId,
        txid,
        amount,
        memo,
        metadata,
        piUserId,
        username,
        status: "failed",
      })

      return NextResponse.json({ error: errorText || "Failed to complete Pi payment" }, { status: 500 })
    }

    const record = await upsertDonationRecord({
      paymentId,
      txid,
      amount,
      memo,
      metadata,
      piUserId,
      username,
      status: "completed",
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete donation" },
      { status: 500 }
    )
  }
}
