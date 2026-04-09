"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { authService, type AuthState, type User } from "@/lib/auth"
import { emailService } from "@/lib/email-service"
import { usePiAuth } from "@/contexts/pi-auth-context"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>
  loginWithFacebook: () => Promise<{ success: boolean; message: string }>
  loginWithTwitter: () => Promise<{ success: boolean; message: string }>
  loginWithGithub: () => Promise<{ success: boolean; message: string }>
  logout: () => void
  authProvider: "pi" | "web" | null
  isPiUser: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: isPiAuthenticated, userData: piUserData } = usePiAuth()

  const [webAuthState, setWebAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setWebAuthState({
      user: currentUser,
      isAuthenticated: currentUser !== null,
      isLoading: false,
    })
  }, [])

  useEffect(() => {
    if (!isPiAuthenticated || !piUserData) return

    const syncedPiUser = authService.syncPiUser({
      id: piUserData.id,
      username: piUserData.username,
    })

    setWebAuthState({
      user: syncedPiUser,
      isAuthenticated: true,
      isLoading: false,
    })
  }, [isPiAuthenticated, piUserData])

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent

    if (userAgent.includes("Mobile")) return "Mobile Device"
    if (userAgent.includes("Tablet")) return "Tablet"
    return "Desktop Computer"
  }

  const getLocationInfo = () => {
    return "Unknown Location"
  }

  const sendLoginAlert = async (user: User) => {
    const loginDetails = {
      device: getDeviceInfo(),
      location: getLocationInfo(),
      time: new Date().toLocaleString(),
    }

    try {
      await emailService.sendLoginAlertEmail(user.email, user.name, loginDetails)
    } catch (error) {
      console.warn("Failed to send login alert email", error)
    }
  }

  const login = async (email: string, password: string) => {
    setWebAuthState((prev) => ({ ...prev, isLoading: true }))

    const result = await authService.login(email, password)

    setWebAuthState({
      user: result.user || null,
      isAuthenticated: result.success,
      isLoading: false,
    })

    if (result.success && result.user) {
      await sendLoginAlert(result.user)
    }

    return {
      success: result.success,
      message: result.message,
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setWebAuthState((prev) => ({ ...prev, isLoading: true }))

    const result = await authService.register(email, password, name)

    if (result.success && result.user) {
      try {
        await emailService.sendAccountCreatedEmail(result.user.email, result.user.name)
      } catch (error) {
        console.warn("Failed to send account created email", error)
      }

      const loginResult = await authService.login(email, password)
      setWebAuthState({
        user: loginResult.user || null,
        isAuthenticated: loginResult.success,
        isLoading: false,
      })
    } else {
      setWebAuthState((prev) => ({ ...prev, isLoading: false }))
    }

    return {
      success: result.success,
      message: result.message,
    }
  }

  const loginWithGoogle = async () => {
    setWebAuthState((prev) => ({ ...prev, isLoading: true }))

    const result = await authService.loginWithGoogle()

    setWebAuthState({
      user: result.user || null,
      isAuthenticated: result.success,
      isLoading: false,
    })

    if (result.success && result.user) {
      try {
        await emailService.sendAccountCreatedEmail(result.user.email, result.user.name)
      } catch (error) {
        console.warn("Failed to send Google account email", error)
      }
    }

    return {
      success: result.success,
      message: result.message,
    }
  }

  const loginWithFacebook = async () => {
    setWebAuthState((prev) => ({ ...prev, isLoading: true }))

    const result = await authService.loginWithFacebook()

    setWebAuthState({
      user: result.user || null,
      isAuthenticated: result.success,
      isLoading: false,
    })

    if (result.success && result.user) {
      try {
        await emailService.sendAccountCreatedEmail(result.user.email, result.user.name)
      } catch (error) {
        console.warn("Failed to send Facebook account email", error)
      }
    }

    return {
      success: result.success,
      message: result.message,
    }
  }

  const loginWithTwitter = async () => {
    setWebAuthState((prev) => ({ ...prev, isLoading: true }))

    const result = await authService.loginWithTwitter()

    setWebAuthState({
      user: result.user || null,
      isAuthenticated: result.success,
      isLoading: false,
    })

    if (result.success && result.user) {
      try {
        await emailService.sendAccountCreatedEmail(result.user.email, result.user.name)
      } catch (error) {
        console.warn("Failed to send Twitter account email", error)
      }
    }

    return {
      success: result.success,
      message: result.message,
    }
  }

  const loginWithGithub = async () => {
    setWebAuthState((prev) => ({ ...prev, isLoading: true }))

    const result = await authService.loginWithGithub()

    setWebAuthState({
      user: result.user || null,
      isAuthenticated: result.success,
      isLoading: false,
    })

    if (result.success && result.user) {
      try {
        await emailService.sendAccountCreatedEmail(result.user.email, result.user.name)
      } catch (error) {
        console.warn("Failed to send GitHub account email", error)
      }
    }

    return {
      success: result.success,
      message: result.message,
    }
  }

  const logout = () => {
    authService.logout()

    setWebAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const resolvedUser = useMemo(() => {
    if (isPiAuthenticated && piUserData) {
      return webAuthState.user
    }

    return webAuthState.user
  }, [isPiAuthenticated, piUserData, webAuthState.user])

  const isAuthenticated = Boolean(resolvedUser)
  const authProvider: "pi" | "web" | null = resolvedUser?.provider === "pi" ? "pi" : resolvedUser ? "web" : null
  const isPiUser = resolvedUser?.provider === "pi"

  return (
    <AuthContext.Provider
      value={{
        user: resolvedUser,
        isAuthenticated,
        isLoading: webAuthState.isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        loginWithTwitter,
        loginWithGithub,
        logout,
        authProvider,
        isPiUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
