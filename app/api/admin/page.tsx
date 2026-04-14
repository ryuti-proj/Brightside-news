"use client"

import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type SessionResponse = {
  authenticated: boolean
  persistent: boolean
  maxAgeSeconds: number
  expiresAt: string | null
}

export default function AdminPage() {
  const router = useRouter()

  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        })

        const data = (await response.json().catch(() => null)) as SessionResponse | null

        if (response.ok && data?.authenticated) {
          setIsCheckingSession(false)
          return
        }
      } catch {
        // ignore session check failure and show login form
      }

      setIsCheckingSession(false)
    }

    void checkSession()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe,
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error || "Login failed")
      }

      const sessionResponse = await fetch("/api/admin/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const sessionPayload = (await sessionResponse.json().catch(() => null)) as SessionResponse | null

      if (!sessionResponse.ok || !sessionPayload?.authenticated) {
        throw new Error("Session could not be established")
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      })
    } finally {
      router.refresh()
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border bg-white p-8 shadow-xl shadow-slate-200/50">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-11 w-11"
              >
                <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">BrightSide Admin</h1>
            <p className="mt-3 text-lg text-slate-600">Secure administration panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-900">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                className="w-full rounded-none border border-slate-900 bg-white px-5 py-4 text-xl text-slate-900 outline-none transition focus:border-blue-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-900">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full rounded-none border border-slate-900 bg-white px-5 py-4 text-xl text-slate-900 outline-none transition focus:border-blue-600"
                required
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
              <span>Remember me</span>
            </label>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || !username.trim() || !password}
              className="w-full rounded-none bg-blue-400 px-5 py-4 text-xl font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-500 underline underline-offset-4"
          >
            Clear admin session
          </button>
        </div>
      </div>
    </div>
  )
}
