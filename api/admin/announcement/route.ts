import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { TelegramBot } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!)
    const users = await Database.getAllUsers()

    let sentCount = 0

    for (const user of users) {
      try {
        await bot.sendMessage(user.id, `📢 <b>DUYURU</b>\n\n${message}`)
        sentCount++

        // Rate limiting - wait 50ms between messages
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        console.error(`Failed to send message to user ${user.id}:`, error)
      }
    }

    return NextResponse.json({ sent: sentCount, total: users.length })
  } catch (error) {
    console.error("Error sending announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
