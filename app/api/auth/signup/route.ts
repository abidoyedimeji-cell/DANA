import { type NextRequest, NextResponse } from "next/server"

// Mock database - replace with real database
const users: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const { credential, method, password } = await request.json()

    if (!credential || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists
    if (users[credential]) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Create new user
    const userId = `user_${Date.now()}`
    users[credential] = {
      userId,
      credential,
      method,
      password, // In production, hash this with bcrypt
      isVerified: false,
      createdAt: new Date(),
    }

    return NextResponse.json({
      userId,
      isVerified: false,
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
