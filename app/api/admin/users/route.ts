import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("👥 GET /api/admin/users - Starting...")

    // Environment check
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("Environment check:", {
      supabaseUrl: supabaseUrl ? "✅ Set" : "❌ Missing",
      supabaseKey: supabaseKey ? "✅ Set" : "❌ Missing",
    })

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Environment variables missing",
          details: {
            supabaseUrl: supabaseUrl ? "Set" : "Missing",
            supabaseKey: supabaseKey ? "Set" : "Missing",
          },
        },
        { status: 500 },
      )
    }

    console.log("👥 Fetching users from database...")
    const users = await Database.getAllUsers()

    console.log("👥 Retrieved users count:", users.length)

    const response = {
      success: true,
      users,
      count: users.length,
      timestamp: new Date().toISOString(),
    }

    console.log("👥 Sending response with", users.length, "users")

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error in GET /api/admin/users:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
