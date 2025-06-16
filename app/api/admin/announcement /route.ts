import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN!
    const db = new Database()
    const users = await db.getAllUsers()

    let sentCount = 0
    let failedCount = 0

    for (const user of users) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: user.id,
            text: `📢 <b>DUYURU</b>\n\n${message}`,
            parse_mode: "HTML",
          }),
        })

        const result = await response.json()

        if (result.ok) {
          sentCount++
        } else {
          failedCount++
          console.error(`Failed to send message to user ${user.id}:`, result.description)
        }

        // Rate limiting - wait 50ms between messages
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        failedCount++
        console.error(`Failed to send message to user ${user.id}:`, error)
      }
    }

    return NextResponse.json({
      sent: sentCount,
      failed: failedCount,
      total: users.length,
    })
  } catch (error) {
    console.error("Error sending announcement:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
