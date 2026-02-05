import { type NextRequest, NextResponse } from "next/server"

// Mock database
const users: Record<string, any> = {}

export async function POST(request: NextRequest) {
  try {
    const { credential, password } = await request.json()

    if (!credential || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const user = users[credential]

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      userId: user.userId,
      isVerified: user.isVerified,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
