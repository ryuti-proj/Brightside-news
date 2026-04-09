import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Simple authentication - in production, use proper authentication
    if (username === "admin" && password === "brightside2024!") {
      return NextResponse.json({
        success: true,
        message: "Authentication successful",
        token: "admin-token-" + Date.now(),
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed",
      },
      { status: 500 },
    )
  }
}
