import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { userId, firstName, lastName, birthDate, gender, location, bio, profilePhoto } = await request.json()

    if (!userId || !firstName || !lastName || !birthDate || !gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // In production, save profile data to database
    console.log("[v0] Profile setup:", {
      userId,
      firstName,
      lastName,
      birthDate,
      gender,
      location,
      bio,
    })

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully",
    })
  } catch (error) {
    console.error("Profile setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
