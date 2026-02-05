import { cookies } from "next/headers"
import { randomBytes } from "crypto"

export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(32).toString("hex")
  const cookieStore = await cookies()

  cookieStore.set("csrf-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  })

  return token
}

export async function validateCsrfToken(token: string): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("csrf-token")?.value
  return token === sessionToken
}
