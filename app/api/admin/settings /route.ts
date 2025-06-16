import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching settings from database...")

    const mainChannelId = await Database.getSetting("main_channel_id")
    const inviteLink = await Database.getSetting("invite_link")

    console.log("Retrieved settings:", { mainChannelId, inviteLink })

    return NextResponse.json({
      success: true,
      settings: {
        main_channel_id: mainChannelId || "",
        invite_link: inviteLink || "",
      },
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { main_channel_id, invite_link } = await request.json()

    console.log("Updating settings:", { main_channel_id, invite_link })

    // Ayarları güncelle
    if (main_channel_id !== undefined) {
      console.log("Updating main_channel_id...")
      await Database.updateSetting("main_channel_id", main_channel_id || "")
    }

    if (invite_link !== undefined) {
      console.log("Updating invite_link...")
      await Database.updateSetting("invite_link", invite_link || "")
    }

    // Güncellenmiş ayarları kontrol et
    const updatedChannelId = await Database.getSetting("main_channel_id")
    const updatedInviteLink = await Database.getSetting("invite_link")

    console.log("Updated settings verified:", { updatedChannelId, updatedInviteLink })

    return NextResponse.json({
      success: true,
      message: "Ayarlar başarıyla güncellendi",
      updated: {
        main_channel_id: updatedChannelId,
        invite_link: updatedInviteLink,
      },
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Ayarlar güncellenirken hata oluştu",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
