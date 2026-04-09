"use client"

// BrightSide News Auth Service
// Version: Phase 2.1 – Unified Pi-First Auth
// See CHANGELOG.md for full history

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider: "pi" | "email" | "google" | "facebook" | "twitter" | "github"
  createdAt: string
  lastLogin: string
  piUsername?: string
  piUserId?: string
  authSource?: "pi" | "web"
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

declare global {
  interface Window {
    google: any
    FB: any
  }
}

class AuthService {
  private static instance: AuthService
  private users: User[] = []
  private currentUser: User | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const usersStored = localStorage.getItem("brightside-users")
      const currentUserStored = localStorage.getItem("brightside-current-user")

      if (usersStored) {
        this.users = JSON.parse(usersStored)
      }
      if (currentUserStored) {
        this.currentUser = JSON.parse(currentUserStored)
      }

      this.initializeGoogleOAuth()
      this.initializeFacebookSDK()
    }
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  private initializeGoogleOAuth() {
    if (typeof window !== "undefined") {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) return

      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        if (window.google) {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

          if (!clientId) {
            console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID not found in environment variables")
            return
          }

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: this.handleGoogleCallback.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
          })
        }
      }
    }
  }

  private initializeFacebookSDK() {
    if (typeof window !== "undefined") {
      const existingScript = document.querySelector('script[src="https://connect.facebook.net/en_US/sdk.js"]')
      if (existingScript) return

      const script = document.createElement("script")
      script.src = "https://connect.facebook.net/en_US/sdk.js"
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      script.onload = () => {
        if (window.FB) {
          const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID

          if (!appId) {
            console.warn("NEXT_PUBLIC_FACEBOOK_APP_ID not found in environment variables")
            return
          }

          window.FB.init({
            appId,
            cookie: true,
            xfbml: true,
            version: "v18.0",
          })
        }
      }
    }
  }

  private handleGoogleCallback(response: any) {
    try {
      const payload = JSON.parse(atob(response.credential.split(".")[1]))

      const googleUser: User = {
        id: `google-${payload.sub}`,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        provider: "google",
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        authSource: "web",
      }

      let user = this.users.find((u) => u.email === googleUser.email && u.provider === "google")
      if (!user) {
        this.users.push(googleUser)
        user = googleUser
      } else {
        user.lastLogin = new Date().toISOString()
        user.avatar = payload.picture
        user.name = payload.name
      }

      this.saveUsers()
      this.currentUser = user
      this.saveCurrentUser()

      window.dispatchEvent(new CustomEvent("google-login-success", { detail: user }))
    } catch (error) {
      console.error("Google login error:", error)
      window.dispatchEvent(new CustomEvent("google-login-error", { detail: error }))
    }
  }

  private saveUsers() {
    if (typeof window !== "undefined") {
      localStorage.setItem("brightside-users", JSON.stringify(this.users))
    }
  }

  private saveCurrentUser() {
    if (typeof window !== "undefined") {
      if (this.currentUser) {
        localStorage.setItem("brightside-current-user", JSON.stringify(this.currentUser))
      } else {
        localStorage.removeItem("brightside-current-user")
      }
    }
  }

  private upsertUser(user: User): User {
    const existingIndex = this.users.findIndex((existingUser) => existingUser.id === user.id)

    if (existingIndex >= 0) {
      this.users[existingIndex] = {
        ...this.users[existingIndex],
        ...user,
        lastLogin: new Date().toISOString(),
      }
      return this.users[existingIndex]
    }

    this.users.push(user)
    return user
  }

  syncPiUser(payload: { id: string; username: string }): User {
    const existingUser =
      this.users.find((user) => user.piUserId === payload.id) ||
      this.users.find((user) => user.provider === "pi" && user.piUsername === payload.username)

    const now = new Date().toISOString()

    const piUser: User = {
      id: existingUser?.id || `pi-${payload.id}`,
      email: existingUser?.email || `${payload.username}@pi.local`,
      name: payload.username,
      avatar: existingUser?.avatar,
      provider: "pi",
      createdAt: existingUser?.createdAt || now,
      lastLogin: now,
      piUsername: payload.username,
      piUserId: payload.id,
      authSource: "pi",
    }

    const savedUser = this.upsertUser(piUser)
    this.currentUser = savedUser
    this.saveUsers()
    this.saveCurrentUser()
    return savedUser
  }

  async register(
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; message: string; user?: User }> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const existingUser = this.users.find((u) => u.email === email)
    if (existingUser) {
      return { success: false, message: "User already exists with this email" }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      provider: "email",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      authSource: "web",
    }

    this.users.push(newUser)
    this.saveUsers()

    return { success: true, message: "Registration successful", user: newUser }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = this.users.find((u) => u.email === email && u.provider === "email")
    if (!user) {
      return { success: false, message: "Invalid email or password" }
    }

    user.lastLogin = new Date().toISOString()
    this.saveUsers()

    this.currentUser = user
    this.saveCurrentUser()

    return { success: true, message: "Login successful", user }
  }

  async loginWithGoogle(): Promise<{ success: boolean; message: string; user?: User }> {
    return new Promise((resolve) => {
      if (!window.google) {
        resolve({
          success: false,
          message:
            "Google OAuth not initialized. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.",
        })
        return
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      if (!clientId) {
        resolve({
          success: false,
          message:
            "Google Client ID not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.",
        })
        return
      }

      const handleSuccess = (event: any) => {
        window.removeEventListener("google-login-success", handleSuccess)
        window.removeEventListener("google-login-error", handleError)
        resolve({ success: true, message: "Google login successful", user: event.detail })
      }

      const handleError = () => {
        window.removeEventListener("google-login-success", handleSuccess)
        window.removeEventListener("google-login-error", handleError)
        resolve({ success: false, message: "Google login failed" })
      }

      window.addEventListener("google-login-success", handleSuccess)
      window.addEventListener("google-login-error", handleError)

      try {
        window.google.accounts.id.prompt()
      } catch {
        resolve({ success: false, message: "Google OAuth not properly configured" })
      }
    })
  }

  async loginWithFacebook(): Promise<{ success: boolean; message: string; user?: User }> {
    return new Promise((resolve) => {
      if (!window.FB) {
        resolve({
          success: false,
          message:
            "Facebook SDK not initialized. Please add NEXT_PUBLIC_FACEBOOK_APP_ID to your environment variables.",
        })
        return
      }

      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID
      if (!appId) {
        resolve({
          success: false,
          message:
            "Facebook App ID not configured. Please add NEXT_PUBLIC_FACEBOOK_APP_ID to your environment variables.",
        })
        return
      }

      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            window.FB.api("/me", { fields: "name,email,picture" }, (userInfo: any) => {
              const facebookUser: User = {
                id: `facebook-${userInfo.id}`,
                email: userInfo.email || `${userInfo.id}@facebook.com`,
                name: userInfo.name,
                avatar: userInfo.picture?.data?.url,
                provider: "facebook",
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                authSource: "web",
              }

              const user = this.upsertUser(facebookUser)
              this.saveUsers()
              this.currentUser = user
              this.saveCurrentUser()

              resolve({ success: true, message: "Facebook login successful", user })
            })
          } else {
            resolve({ success: false, message: "Facebook login cancelled" })
          }
        },
        { scope: "email" },
      )
    })
  }

  async loginWithTwitter(): Promise<{ success: boolean; message: string; user?: User }> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockTwitterUser: User = {
      id: `twitter-${Date.now()}`,
      email: "user@twitter.com",
      name: "Twitter User",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format&q=80",
      provider: "twitter",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      authSource: "web",
    }

    const user = this.upsertUser(mockTwitterUser)
    this.saveUsers()
    this.currentUser = user
    this.saveCurrentUser()

    return { success: true, message: "Twitter login successful (demo)", user }
  }

  async loginWithGithub(): Promise<{ success: boolean; message: string; user?: User }> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockGithubUser: User = {
      id: `github-${Date.now()}`,
      email: "user@github.com",
      name: "GitHub User",
      avatar: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=100&h=100&fit=crop&auto=format&q=80",
      provider: "github",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      authSource: "web",
    }

    const user = this.upsertUser(mockGithubUser)
    this.saveUsers()
    this.currentUser = user
    this.saveCurrentUser()

    return { success: true, message: "GitHub login successful (demo)", user }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  logout(): void {
    this.currentUser = null
    this.saveCurrentUser()
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
}

export const authService = AuthService.getInstance()
