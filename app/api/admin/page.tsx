"use client"

import { useState } from "react"

export default function AdminPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin() {
    setError("")

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, remember }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Login failed")
      return
    }

    if (data?.token) {
      if (remember) {
        localStorage.setItem("admin_token", data.token)
      } else {
        sessionStorage.setItem("admin_token", data.token)
      }
    } else {
      setError("Admin session could not be established")
      return
    }

    window.location.href = "/admin"
  }

  return (
    <div>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        Remember me
      </label>

      <button onClick={handleLogin}>Sign In</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  )
}