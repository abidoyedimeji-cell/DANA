import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.from("venues").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching venues:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Server error fetching venues:", error)
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 })
  }
}
