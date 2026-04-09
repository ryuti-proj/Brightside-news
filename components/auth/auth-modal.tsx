"use client"

// BrightSide News Auth Modal
// Version: Phase 2.2 – Pi login enabled from locked UI baseline
// See CHANGELOG.md for full history

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Input } from "@/components/ui/input"
import { X, Eye, EyeOff, Smartphone, Mail, Lock, User, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePiAuth } from "@/contexts/pi-auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "login" | "register"
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const { login, register } = useAuth()
  const { reinitialize, isAuthenticated: isPiAuthenticated, authMessage, hasError, isLoading } = usePiAuth()

  const [mounted, setMounted] = useState(false)
  const [mode, setMode] = useState<"login" | "register">(initialMode)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen) return

    setMode(initialMode)
    setError("")
    setInfo("")
    document.body.classList.add("modal-open")

    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [isOpen, initialMode])

  useEffect(() => {
    if (!isOpen) return

    if (isPiAuthenticated) {
      onClose()
    }
  }, [isPiAuthenticated, isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return

    if (!hasError && authMessage && authMessage !== "Pi login successful") {
      if (
        authMessage.includes("Loading Pi Network") ||
        authMessage.includes("Initializing Pi Network") ||
        authMessage.includes("Authenticating with Pi Network") ||
        authMessage.includes("Logging in")
      ) {
        setInfo(authMessage)
      }
    }

    if (hasError && authMessage) {
      setError(authMessage)
      setInfo("")
    }
  }, [authMessage, hasError, isOpen])

  if (!mounted || !isOpen) return null

  const isPiBrowser =
    typeof window !== "undefined" && typeof (window as any).Pi !== "undefined"

  const handleSubmit = async () => {
    setError("")
    setInfo("")

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name")
        return
      }

      if (!email.trim()) {
        setError("Please enter your email")
        return
      }

      if (!password.trim()) {
        setError("Please create a password")
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      const result = await register(email, password, name)
      if (!result.success) {
        setError(result.message)
        return
      }

      onClose()
      return
    }

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    if (!password.trim()) {
      setError("Please enter your password")
      return
    }

    const result = await login(email, password)
    if (!result.success) {
      setError(result.message)
      return
    }

    onClose()
  }

  const handlePiClick = async () => {
    setError("")
    setInfo("")

    if (!isPiBrowser) {
      setInfo("Pi Browser not detected here. Test the real Pi login on your deployed app inside the Pi Browser.")
      return
    }

    try {
      await reinitialize()
    } catch (err) {
      setError("Pi login failed. Please try again.")
    }
  }

  const modal = (
    <div className="fixed inset-0 z-[2147483647] overflow-y-auto bg-black/60 p-3 sm:p-6">
      <div className="flex min-h-full items-start justify-center py-3 sm:items-center sm:py-6">
        <div className="relative z-[2147483647] my-auto flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[calc(100svh-1.5rem)] sm:max-h-[calc(100svh-3rem)]">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="overflow-y-auto px-5 pb-5 pt-5 sm:px-8 sm:pb-8 sm:pt-8">
            <div className="mb-5 pr-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === "login" ? "Sign In" : "Create Account"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Pi-first access for BrightSide News, with email as a browser-testing fallback.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-full bg-violet-600 p-2 text-white">
                  <Smartphone className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-violet-900">
                    Continue with Pi
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-violet-800">
                    {isPiBrowser
                      ? "Pi Browser detected. Use Pi as your primary BrightSide identity."
                      : "To use Pi login, open BrightSide News inside Pi Browser."}
                  </p>

                  <button
                    type="button"
                    onClick={handlePiClick}
                    disabled={isLoading}
                    className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-3 font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Smartphone className="h-4 w-4" />
                      )}
                      {isLoading ? "Connecting to Pi..." : isPiBrowser ? "Use Pi Login" : "Open in Pi Browser"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-sm text-gray-500">
                  or use email
                </span>
              </div>
            </div>

            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {!error && info ? (
              <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                {info}
              </div>
            ) : null}

            <div className="space-y-4">
              {mode === "register" ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-14 pl-11"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-800">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" ? (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-14 pl-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                      aria-label="Toggle confirm password"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={handleSubmit}
                className="w-full rounded-xl bg-blue-600 px-4 py-4 text-lg font-semibold text-white hover:bg-blue-700"
              >
                {mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </div>

            <p className="mt-5 text-center text-sm text-gray-600">
              {mode === "login" ? (
                <>
                  No account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("register")
                      setError("")
                      setInfo("")
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have one?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login")
                      setError("")
                      setInfo("")
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default AuthModal
