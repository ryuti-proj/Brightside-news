import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      error: "Legacy Pi preview login route is no longer used. Pi login now uses the Pi SDK directly.",
    },
    { status: 410 }
  )
}