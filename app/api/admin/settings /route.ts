import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/admin/settings - Starting...")

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

    console.log("🔍 Fetching settings from database...")

    const mainChannelId = await Database.getSetting("main_channel_id")
    const inviteLink = await Database.getSetting("invite_link")

    console.log("🔍 Retrieved settings:", { mainChannelId, inviteLink })

    const response = {
      success: true,
      settings: {
        main_channel_id: mainChannelId || "",
        invite_link: inviteLink || "",
      },
      timestamp: new Date().toISOString(),
    }

    console.log("🔍 Sending response:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error in GET /api/admin/settings:", error)

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

export async function POST(request: NextRequest) {
  try {
    console.log("📝 POST /api/admin/settings - Starting...")

    const body = await request.json()
    const { main_channel_id, invite_link } = body

    console.log("📝 Received data:", { main_channel_id, invite_link })

    // Environment check
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Environment variables missing",
        },
        { status: 500 },
      )
    }

    // Ayarları güncelle
    if (main_channel_id !== undefined) {
      console.log("📝 Updating main_channel_id...")
      await Database.updateSetting("main_channel_id", main_channel_id || "")
    }

    if (invite_link !== undefined) {
      console.log("📝 Updating invite_link...")
      await Database.updateSetting("invite_link", invite_link || "")
    }

    // Güncellenmiş ayarları kontrol et
    const updatedChannelId = await Database.getSetting("main_channel_id")
    const updatedInviteLink = await Database.getSetting("invite_link")

    console.log("📝 Updated settings verified:", { updatedChannelId, updatedInviteLink })

    const response = {
      success: true,
      message: "Ayarlar başarıyla güncellendi",
      updated: {
        main_channel_id: updatedChannelId,
        invite_link: updatedInviteLink,
      },
      timestamp: new Date().toISOString(),
    }

    console.log("📝 Sending response:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error in POST /api/admin/settings:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Ayarlar güncellenirken hata oluştu",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
