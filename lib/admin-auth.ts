import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

export const ADMIN_COOKIE_NAME = "brightside-admin-session"
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

type SessionPayload = {
  token: string
  expiresAt: number
}

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_USERNAME ||
    "brightside-admin-fallback-secret"
  )
}

function sign(value: string) {
  return crypto.createHmac("sha256", getAdminSessionSecret()).update(value).digest("hex")
}

function encodePayload(payload: SessionPayload) {
  const raw = JSON.stringify(payload)
  const base = Buffer.from(raw).toString("base64url")
  const signature = sign(base)
  return `${base}.${signature}`
}

function decodePayload(value: string): SessionPayload | null {
  const [base, signature] = value.split(".")

  if (!base || !signature) {
    return null
  }

  const expected = sign(base)

  if (signature !== expected) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(base, "base64url").toString("utf8")) as SessionPayload

    if (!payload?.token || typeof payload.expiresAt !== "number") {
      return null
    }

    if (Date.now() > payload.expiresAt) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function createAdminSessionCookieValue(maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS) {
  return encodePayload({
    token: crypto.randomUUID(),
    expiresAt: Date.now() + maxAgeSeconds * 1000,
  })
}

export function getAdminSessionMaxAgeSeconds() {
  return DEFAULT_MAX_AGE_SECONDS
}

export function getAdminSession(request: NextRequest) {
  const cookieValue = request.cookies.get(ADMIN_COOKIE_NAME)?.value

  if (!cookieValue) {
    return null
  }

  return decodePayload(cookieValue)
}

export function isAdminAuthenticated(request: NextRequest) {
  return Boolean(getAdminSession(request))
}

export function requireAdminRequest(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}

export function applyAdminSessionCookie(response: NextResponse, maxAgeSeconds = DEFAULT_MAX_AGE_SECONDS) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: createAdminSessionCookieValue(maxAgeSeconds),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  })

  return response
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return response
}