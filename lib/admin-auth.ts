import { NextRequest, NextResponse } from "next/server"

export const ADMIN_COOKIE_NAME = "brightside-admin-session"
const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 8
const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function getSameSite() {
  return process.env.NODE_ENV === "production" ? "none" : "lax"
}

export function getAdminSessionMaxAgeSeconds(rememberMe?: boolean) {
  return rememberMe ? REMEMBER_ME_MAX_AGE_SECONDS : DEFAULT_MAX_AGE_SECONDS
}

export function isAdminAuthenticated(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)
  return Boolean(cookie?.value)
}

export function requireAdminRequest(request: NextRequest) {
  if (!isAdminAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}

export function applyAdminSessionCookie(response: NextResponse, rememberMe = false) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: `admin:${Date.now()}`,
    httpOnly: true,
    sameSite: getSameSite(),
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getAdminSessionMaxAgeSeconds(rememberMe),
  })

  return response
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: getSameSite(),
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return response
}
