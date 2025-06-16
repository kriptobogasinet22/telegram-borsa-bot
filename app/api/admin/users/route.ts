import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // In production, add admin authentication here
    const users = await Database.getAllUsers()

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
