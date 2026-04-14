"use client"

import { useState, useEffect } from "react"
import { getAdminToken } from "@/lib/admin-client"
import { AdminUsers } from "@/components/admin-users"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const token = getAdminToken()
    setIsAuthenticated(!!token)
  }, [])

  if (isAuthenticated === null) return null

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />
  }

  return <AdminDashboard />
}

function AdminDashboard() {
  return (
    <div className="p-4">
      <AdminUsers />
    </div>
  )
}

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password, rememberMe }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setError(data?.error || "Invalid credentials")
        return
      }

      if (!data?.token) {
        setError("Admin session could not be established")
        return
      }

      // ✅ STORE TOKEN FIRST (CRITICAL FIX)
      if (rememberMe) {
        localStorage.setItem("admin_token", data.token)
        sessionStorage.removeItem("admin_token")
      } else {
        sessionStorage.setItem("admin_token", data.token)
        localStorage.removeItem("admin_token")
      }

      onLogin()

      // force reload into authenticated state
      window.location.replace("/admin")
    } catch {
      setError("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md p-6 rounded-2xl border shadow-sm">
        <h1 className="text-xl font-semibold mb-4">BrightSide Admin</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border rounded p-2"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded p-2"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded p-2 disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}