import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET() {
  try {
    console.log("🔍 Settings GET request received")

    const mainChannelLink = await Database.getSetting("main_channel_link")
    const mainChannelId = await Database.getSetting("main_channel_id")
    const inviteLink = await Database.getSetting("invite_link")

    console.log("📊 Settings fetched:", { mainChannelLink, mainChannelId, inviteLink })

    return NextResponse.json({
      settings: {
        main_channel_link: mainChannelLink || "",
        main_channel_id: mainChannelId || "",
        invite_link: inviteLink || "",
      },
    })
  } catch (error) {
    console.error("❌ Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { main_channel_link, main_channel_id, invite_link } = await request.json()

    console.log("📝 Received settings:", { main_channel_link, main_channel_id, invite_link })

    // Tüm ayarları güncelle
    if (main_channel_link !== undefined) {
      await Database.updateSetting("main_channel_link", main_channel_link || "")
    }

    if (main_channel_id !== undefined) {
      await Database.updateSetting("main_channel_id", main_channel_id || "")
    }

    if (invite_link !== undefined) {
      await Database.updateSetting("invite_link", invite_link || "")
    }

    console.log("✅ Settings updated successfully")

    return NextResponse.json({
      success: true,
      message: "Ayarlar başarıyla güncellendi",
      updated: {
        main_channel_link,
        main_channel_id,
        invite_link,
      },
    })
  } catch (error) {
    console.error("❌ Error updating settings:", error)
    return NextResponse.json(
      {
        error: "Ayarlar güncellenirken hata oluştu",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
