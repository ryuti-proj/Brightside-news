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
    const piAccessToken = typeof body?.piAccessToken === "string" ? body.piAccessToken : null
    const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : null

    if (!paymentId || !txid || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment completion request" }, { status: 400 })
    }

    if (!piAccessToken) {
      return NextResponse.json({ error: "Missing Pi access token" }, { status: 400 })
    }

    const completeUrl = BACKEND_URLS.COMPLETE_PAYMENT(paymentId)
    console.log("[DONATION COMPLETE] Calling:", completeUrl)

    const completeResponse = await fetch(completeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${piAccessToken}`,
      },
      body: JSON.stringify({ txid }),
    })

    const responseText = await completeResponse.text().catch(() => "")
    console.log("[DONATION COMPLETE] Status:", completeResponse.status)
    console.log("[DONATION COMPLETE] Response:", responseText)

    if (!completeResponse.ok) {
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

      return NextResponse.json(
        {
          error: responseText || "Failed to complete Pi payment",
          status: completeResponse.status,
        },
        { status: 500 }
      )
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
    console.error("[DONATION COMPLETE] Exception:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to complete donation" },
      { status: 500 }
    )
  }
}