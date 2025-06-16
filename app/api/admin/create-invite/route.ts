import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json()

    if (!chatId) {
      return NextResponse.json({ error: "Chat ID required" }, { status: 400 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN!

    // Önce chat'in var olup olmadığını kontrol et
    const getChatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
      }),
    })

    const getChatResult = await getChatResponse.json()

    if (!getChatResult.ok) {
      return NextResponse.json(
        {
          error: `Kanal bulunamadı: ${getChatResult.description}. Bot'un kanala admin olarak eklendiğinden emin olun.`,
        },
        { status: 400 },
      )
    }

    // Davet linki oluştur
    const response = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        name: "Bot Kullanıcıları",
        creates_join_request: true, // Join request oluşturacak
      }),
    })

    const result = await response.json()

    if (result.ok) {
      // Davet linkini database'e kaydet
      await Database.updateSetting("invite_link", result.result.invite_link)

      return NextResponse.json({
        invite_link: result.result.invite_link,
        expire_date: result.result.expire_date,
      })
    } else {
      return NextResponse.json(
        {
          error: `Davet linki oluşturulamadı: ${result.description}`,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("Create invite link error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
