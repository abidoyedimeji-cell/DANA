"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { COUNTRY_DIAL_CODES, toE164 } from "@/lib/constants/countryCodes"
import { CheckCircle2, Mail, AlertCircle } from "lucide-react"

interface SignupFormProps {
  onToggle: () => void
}

export function SignupForm({ onToggle }: SignupFormProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    username: "",
    gender: "",
    email: "",
    countryCode: "+44",
    phoneNational: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const { supabase } = useAuth()

  useEffect(() => {
    console.log("[v0] SignupForm mounted, supabase:", !!supabase)
  }, [supabase])

  const handleResendEmail = async () => {
    setIsResending(true)
    setResendSuccess(false)
    setError("")

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setResendSuccess(true)
      console.log("[v0] Verification email resent successfully via Supabase")
    } catch (err) {
      console.error("[v0] Resend error:", err)
      setError(err instanceof Error ? err.message : "Failed to resend email. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted!")

    setError("")
    setIsLoading(true)

    try {
      if (!formData.firstName?.trim()) throw new Error("First name is required")
      if (!formData.username?.trim()) throw new Error("Nickname is required")
      if (formData.username.length < 3) throw new Error("Nickname must be at least 3 characters")
      if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
        throw new Error("Nickname can only contain letters, numbers, and underscores")
      if (!formData.gender) throw new Error("Gender is required")
      if (!formData.email?.trim()) throw new Error("Email is required")
      if (!formData.email.includes("@")) throw new Error("Valid email is required")
      const fullPhone = toE164(formData.countryCode, formData.phoneNational)
      if (!formData.phoneNational?.trim()) throw new Error("Phone number is required")
      if (!/^\+?[1-9]\d{1,14}$/.test(fullPhone)) throw new Error("Invalid phone number – use country code and number (e.g. 7911123456 for UK)")
      if (!formData.password) throw new Error("Password is required")
      if (formData.password.length < 6) throw new Error("Password must be at least 6 characters")

      if (!supabase) throw new Error("Authentication service unavailable")

      console.log("[v0] Creating auth user for:", formData.email)

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: formData.firstName.trim(),
            username: formData.username.trim().toLowerCase(),
            gender: formData.gender,
            ...(fullPhone ? { phone: fullPhone } : {}),
          },
        },
      })

      console.log("[v0] Auth response:", { user: authData?.user?.id, error: signUpError?.message })

      if (signUpError) {
        if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
          throw new Error("This email is already registered. Please sign in or use a different email.")
        }
        throw signUpError
      }

      if (!authData.user) throw new Error("Failed to create user account")

      console.log("[v0] User created, Supabase will send confirmation email")

      setSuccess(true)
    } catch (err) {
      console.error("[v0] Signup error:", err)
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-border">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent a confirmation link to <strong>{formData.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">What happens next?</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Check your inbox for our welcome email</li>
              <li>Click the confirmation link to verify your account</li>
              <li>Complete your profile setup and take the compatibility quiz</li>
              <li>Start discovering compatible matches and amazing venues!</li>
            </ol>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Can't find the email?</p>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Look for emails from noreply@mail.app.supabase.io</li>
                  <li>• Add our email to your contacts</li>
                  <li>• Wait a few minutes - emails can be delayed</li>
                </ul>
              </div>
            </div>

            {resendSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Mail className="w-4 h-4" />
                <span>New confirmation email sent!</span>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleResendEmail}
              disabled={isResending}
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
            >
              {isResending ? "Sending..." : "Resend Confirmation Email"}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Wrong email?{" "}
            <button onClick={() => setSuccess(false)} className="text-[#E91E8C] hover:underline font-medium">
              Try a different email
            </button>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Join Dana</CardTitle>
        <CardDescription>Create your account to start connecting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={isLoading}
              required
              className="border-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Nickname</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a nickname"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={isLoading}
              required
              minLength={3}
              pattern="[a-zA-Z0-9_]+"
              title="Nickname can only contain letters, numbers, and underscores"
              className="border-white"
            />
            <p className="text-xs text-muted-foreground">3+ characters, letters, numbers, and underscores only</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
              disabled={isLoading}
              required
            >
              <SelectTrigger id="gender" className="border-white w-full">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="non-binary">Non-binary</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              required
              className="border-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <div className="flex gap-2">
              <Select
                value={formData.countryCode}
                onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
                disabled={isLoading}
              >
                <SelectTrigger id="countryCode" className="border-white w-[130px] shrink-0">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_DIAL_CODES.map(({ dialCode, label }) => (
                    <SelectItem key={dialCode} value={dialCode}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="phone"
                type="tel"
                placeholder="7911 123456"
                value={formData.phoneNational}
                onChange={(e) => setFormData({ ...formData, phoneNational: e.target.value })}
                disabled={isLoading}
                required
                className="border-white flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">Select country code, then enter number without leading zero</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password (min. 6 characters)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
              required
              minLength={6}
              className="border-white"
            />
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <Button type="submit" className="w-full bg-[#E91E8C] hover:bg-[#E91E8C]/90" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={onToggle} className="text-[#E91E8C] hover:underline font-medium">
            Sign in
          </button>
        </p>
      </CardContent>
    </Card>
  )
}
