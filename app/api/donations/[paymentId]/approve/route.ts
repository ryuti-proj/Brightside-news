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
    const piUserId = typeof body?.piUserId === "string" ? body.piUserId : null
    const username = typeof body?.username === "string" ? body.username : null
    const metadata = body?.metadata && typeof body.metadata === "object" ? body.metadata : null

    if (!paymentId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid payment approval request" }, { status: 400 })
    }

    const serverApiKey = process.env.PI_SERVER_API_KEY

    if (!serverApiKey) {
      return NextResponse.json(
        { error: "Missing PI_SERVER_API_KEY on server" },
        { status: 500 }
      )
    }

    const approveUrl = BACKEND_URLS.APPROVE_PAYMENT(paymentId)

    const approveResponse = await fetch(approveUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${serverApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    })

    const responseText = await approveResponse.text().catch(() => "")

    if (!approveResponse.ok) {
      await upsertDonationRecord({
        paymentId,
        amount,
        memo,
        metadata,
        piUserId,
        username,
        status: "failed",
      })

      return NextResponse.json(
        {
          error: responseText || "Failed to approve Pi payment",
          status: approveResponse.status,
        },
        { status: approveResponse.status }
      )
    }

    const record = await upsertDonationRecord({
      paymentId,
      amount,
      memo,
      metadata,
      piUserId,
      username,
      status: "approved",
    })

    return NextResponse.json({ success: true, record })
  } catch (error) {
    console.error("[DONATION APPROVE] Exception:", error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve donation" },
      { status: 500 }
    )
  }
}