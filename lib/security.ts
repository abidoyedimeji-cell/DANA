import { headers } from "next/headers"
import bcrypt from "bcryptjs"

// Re-export sanitizeInput from utils for backward compatibility
export { sanitizeInput, sanitizeHtml } from "./utils"

// Password hashing (note: Supabase handles this automatically)
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Rate limiting per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export async function checkRateLimit(identifier?: string, maxRequests = 10, windowMs = 60000): Promise<boolean> {
  const headersList = await headers()
  const ip = identifier || headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"

  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

// CSRF token validation
export function validateCsrfFromHeaders(token: string | null, headerToken: string | null): boolean {
  if (!token || !headerToken) return false
  return token === headerToken
}

// Secure headers for responses
export function getSecureHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  }
}
