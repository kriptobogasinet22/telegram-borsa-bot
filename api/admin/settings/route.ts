import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const mainChannelLink = await Database.getSetting("main_channel_link")
    const mainChannelId = await Database.getSetting("main_channel_id")

    return NextResponse.json({
      settings: {
        main_channel_link: mainChannelLink || "",
        main_channel_id: mainChannelId || "",
      },
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { main_channel_link, main_channel_id } = await request.json()

    await Database.updateSetting("main_channel_link", main_channel_link)
    await Database.updateSetting("main_channel_id", main_channel_id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
