"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function SocialSignup() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(provider)

    const userId = `${provider.toLowerCase()}_${Date.now()}`
    localStorage.setItem("userId", userId)
    localStorage.setItem("userEmail", `user@${provider.toLowerCase()}.com`)
    localStorage.setItem("isVerified", "true")
    localStorage.setItem("signupMethod", provider.toLowerCase())

    setTimeout(() => {
      window.location.replace("/dashboard")
    }, 100)
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent"
        onClick={() => handleSocialLogin("Google")}
        disabled={isLoading !== null}
      >
        {isLoading === "Google" ? (
          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent"
        onClick={() => handleSocialLogin("Apple")}
        disabled={isLoading !== null}
      >
        {isLoading === "Apple" ? (
          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        )}
        Apple
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent"
        onClick={() => handleSocialLogin("Facebook")}
        disabled={isLoading !== null}
      >
        {isLoading === "Facebook" ? (
          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        Facebook
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full bg-transparent"
        onClick={() => handleSocialLogin("LinkedIn")}
        disabled={isLoading !== null}
      >
        {isLoading === "LinkedIn" ? (
          <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.045-8.733 0-9.642h3.554v1.364c.429-.661 1.196-1.584 2.907-1.584 2.123 0 3.716 1.387 3.716 4.369v5.493zM5.337 9.432c-1.144 0-1.915-.762-1.915-1.715 0-.953.77-1.715 1.97-1.715 1.144 0 1.915.762 1.915 1.715 0 .953-.771 1.715-1.97 1.715zm1.575 11.02H3.762V9.81h3.15v10.642zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
          </svg>
        )}
        LinkedIn
      </Button>
    </div>
  )
}
