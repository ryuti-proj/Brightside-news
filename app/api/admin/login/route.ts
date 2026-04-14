import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { username, password, remember } = await req.json()

  if (username === "ryuti" && password === "V1ct0r1@") {
    const token = "secure-admin-token"

    const res = NextResponse.json({
      ok: true,
      token,
    })

    res.cookies.set("admin_session", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: remember ? 60 * 60 * 24 * 30 : undefined,
    })

    return res
  }

  return NextResponse.json(
    { error: "Invalid credentials" },
    { status: 401 }
  )
}