"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/hooks/use-notifications"
import { useEffect, useState } from "react"

interface SocialLoginProps {
  onClose: () => void
}

export function SocialLogin({ onClose }: SocialLoginProps) {
  const { loginWithGoogle, loginWithFacebook, loginWithTwitter, loginWithGithub, isLoading } = useAuth()
  const { success, error } = useNotifications()
  const [googleReady, setGoogleReady] = useState(false)
  const [facebookReady, setFacebookReady] = useState(false)
  const [hasGoogleClientId, setHasGoogleClientId] = useState(false)
  const [hasFacebookAppId, setHasFacebookAppId] = useState(false)

  useEffect(() => {
    // Check if environment variables are set
    setHasGoogleClientId(!!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
    setHasFacebookAppId(!!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID)

    // Check if Google is ready
    const checkGoogle = () => {
      if (window.google && window.google.accounts && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        setGoogleReady(true)
        // Render Google button
        try {
          window.google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
          })
        } catch (err) {
          console.log("Google button render failed:", err)
        }
      }
    }

    // Check if Facebook is ready
    const checkFacebook = () => {
      if (window.FB && process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
        setFacebookReady(true)
      }
    }

    // Check immediately
    checkGoogle()
    checkFacebook()

    // Set up intervals to check periodically
    const googleInterval = setInterval(checkGoogle, 1000)
    const facebookInterval = setInterval(checkFacebook, 1000)

    // Clean up after 10 seconds
    setTimeout(() => {
      clearInterval(googleInterval)
      clearInterval(facebookInterval)
    }, 10000)

    return () => {
      clearInterval(googleInterval)
      clearInterval(facebookInterval)
    }
  }, [])

  const handleSocialLogin = async (
    provider: string,
    loginFunction: () => Promise<{ success: boolean; message: string }>,
  ) => {
    try {
      const result = await loginFunction()

      if (result.success) {
        success(
          `Welcome! 🎉`,
          `You have successfully signed in with ${provider}. Check your email for a welcome message!`,
        )
        onClose()
      } else {
        error(`${provider} Login Failed`, result.message)
      }
    } catch (err) {
      error(`${provider} Error`, `An error occurred while signing in with ${provider}. Please try again.`)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Google Sign-In Button Container */}
        {hasGoogleClientId && <div id="google-signin-button" className="w-full min-h-[40px]"></div>}

        {/* Fallback Google Button */}
        {(!googleReady || !hasGoogleClientId) && (
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("Google", loginWithGoogle)}
            disabled={isLoading || !hasGoogleClientId}
            className="w-full flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
            {!hasGoogleClientId && " (Setup Required)"}
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => handleSocialLogin("Facebook", loginWithFacebook)}
          disabled={isLoading || !hasFacebookAppId}
          className="w-full flex items-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Continue with Facebook
          {!hasFacebookAppId && " (Setup Required)"}
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin("Twitter", loginWithTwitter)}
          disabled={isLoading}
          className="w-full flex items-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="#1DA1F2" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
          Continue with Twitter (Demo)
        </Button>

        <Button
          variant="outline"
          onClick={() => handleSocialLogin("GitHub", loginWithGithub)}
          disabled={isLoading}
          className="w-full flex items-center gap-2 border-gray-300 hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="#333" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Continue with GitHub (Demo)
        </Button>
      </div>

      {(!hasGoogleClientId || !hasFacebookAppId) && (
        <div className="text-xs text-gray-500 text-center mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="font-medium mb-1">🔧 Setup Required for Real OAuth:</p>
          <p>Add these environment variables to your .env.local file:</p>
          {!hasGoogleClientId && (
            <p className="font-mono text-xs">NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id</p>
          )}
          {!hasFacebookAppId && <p className="font-mono text-xs">NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id</p>}
          <p className="mt-2 text-blue-600">
            <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">
              Get Google Client ID
            </a>
            {" | "}
            <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">
              Get Facebook App ID
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
