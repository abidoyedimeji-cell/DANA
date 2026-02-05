import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") || "/onboarding/mode"

  if (code) {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      console.log("[v0] User authenticated via callback:", data.user.id)

      let retries = 3
      let profile = null

      while (retries > 0 && !profile) {
        const { data: profileData } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

        if (profileData) {
          profile = profileData
          break
        }

        // Wait 500ms before retry
        await new Promise((resolve) => setTimeout(resolve, 500))
        retries--
      }

      if (profile) {
        console.log("[v0] Profile exists for user:", data.user.id)
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      } else {
        console.warn("[v0] Profile not found after retries")
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=profile_creation_failed`)
      }
    }

    console.error("[v0] Auth callback error:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_failed`)
  }

  // No code provided
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}
