import { type NextRequest, NextResponse } from "next/server"
import { TelegramBot, type TelegramUpdate } from "@/lib/telegram"
import { BotCommands } from "@/lib/bot-commands"
import { Database } from "@/lib/database"

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!)
const commands = new BotCommands(bot)

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()

    // Handle join requests
    if (update.chat_join_request) {
      const { chat_join_request } = update
      const userId = chat_join_request.from.id
      const chatId = chat_join_request.chat.id

      // Join request'i kaydet
      await Database.createJoinRequest({
        user_id: userId,
        chat_id: chatId,
        username: chat_join_request.from.username,
        first_name: chat_join_request.from.first_name,
        last_name: chat_join_request.from.last_name,
        bio: chat_join_request.bio,
      })

      // Kullanıcıyı direkt aktif et (onay beklemeden)
      await Database.updateUserMembership(userId, true)

      // Kullanıcıya hoş geldin mesajı gönder
      try {
        const welcomeMessage = `✅ <b>Katılma isteğiniz alındı!</b>

Artık botu kullanabilirsiniz! İsteğiniz admin tarafından değerlendirilecek.

🚀 <b>Başlamak için:</b>
• /start - Ana menü
• THYAO - Hisse analizi
• /bulten - Piyasa özeti

<b>Popüler Komutlar:</b>
• /derinlik THYAO
• /teknik AKBNK  
• /haber GARAN`

        await bot.sendMessage(userId, welcomeMessage)
      } catch (error) {
        console.error(`Failed to send welcome message to ${userId}:`, error)
      }

      return NextResponse.json({ ok: true })
    }

    // Handle chat member updates (when user is approved/declined)
    if (update.chat_member) {
      const { chat_member } = update
      const userId = chat_member.new_chat_member.user.id
      const chatId = chat_member.chat.id
      const newStatus = chat_member.new_chat_member.status

      // Eğer kullanıcı onaylandıysa
      if (["member", "administrator", "creator"].includes(newStatus)) {
        await Database.updateJoinRequestStatus(userId, chatId, "approved")
        await Database.updateUserMembership(userId, true)

        // Kullanıcıya hoş geldin mesajı gönder
        try {
          const welcomeMessage = `✅ <b>Hoş geldiniz!</b>

Kanal üyeliğiniz onaylandı. Artık botu kullanabilirsiniz!

/start komutu ile başlayabilirsiniz.`

          await bot.sendMessage(userId, welcomeMessage)
        } catch (error) {
          console.error(`Failed to send welcome message to ${userId}:`, error)
        }
      }

      return NextResponse.json({ ok: true })
    }

    // Handle callback queries
    if (update.callback_query) {
      const { callback_query } = update
      const userId = callback_query.from.id
      const chatId = callback_query.message?.chat.id!
      const data = callback_query.data!

      await bot.answerCallbackQuery(callback_query.id)

      if (data === "check_membership") {
        await commands.checkMembership(userId, chatId)
      } else if (data.startsWith("derinlik_")) {
        const stockCode = data.replace("derinlik_", "")
        const analysis = await commands.getDepthAnalysis(stockCode)
        await bot.sendMessage(chatId, analysis)
      } else if (data.startsWith("teorik_")) {
        const stockCode = data.replace("teorik_", "")
        const analysis = await commands.getTheoreticalAnalysis(stockCode)
        await bot.sendMessage(chatId, analysis)
      } else if (data.startsWith("favori_ekle_")) {
        const stockCode = data.replace("favori_ekle_", "")
        await commands.addFavorites(userId, chatId, [stockCode])
      }

      return NextResponse.json({ ok: true })
    }

    // Handle messages
    if (update.message) {
      const { message } = update
      const userId = message.from?.id!
      const chatId = message.chat.id
      const text = message.text || ""

      // /start dışındaki komutlar için üyelik kontrolü
      if (!text.startsWith("/start")) {
        const user = await Database.getUser(userId)
        const mainChannelId = await Database.getSetting("main_channel_id")
        const joinRequest = mainChannelId ? await Database.getJoinRequest(userId, Number.parseInt(mainChannelId)) : null

        // Eğer kullanıcı üye değilse VE join request'i yoksa start'a yönlendir
        if (!user?.is_member && !joinRequest) {
          await commands.handleStart(userId, chatId, message.from!)
          return NextResponse.json({ ok: true })
        }

        // Join request varsa ama üye değilse, üye yap
        if (!user?.is_member && joinRequest) {
          await Database.updateUserMembership(userId, true)
        }
      }

      // Handle all commands
      if (text.startsWith("/start")) {
        await commands.handleStart(userId, chatId, message.from!)
      } else if (text.startsWith("/derinlik ")) {
        const stockCode = text.replace("/derinlik ", "").toUpperCase()
        const analysis = await commands.getDepthAnalysis(stockCode)
        await bot.sendMessage(chatId, analysis)
      } else if (text.startsWith("/teorik ")) {
        const stockCode = text.replace("/teorik ", "").toUpperCase()
        const analysis = await commands.getTheoreticalAnalysis(stockCode)
        await bot.sendMessage(chatId, analysis)
      } else if (text.startsWith("/akd ")) {
        const stockCode = text.replace("/akd ", "").toUpperCase()
        await bot.sendMessage(chatId, `🏢 ${stockCode} için AKD analizi hazırlanıyor...`)
      } else if (text.startsWith("/takas ")) {
        const stockCode = text.replace("/takas ", "").toUpperCase()
        await bot.sendMessage(chatId, `💱 ${stockCode} için takas analizi hazırlanıyor...`)
      } else if (text.startsWith("/temel ")) {
        const stockCode = text.replace("/temel ", "").toUpperCase()
        const analysis = await commands.getCompanyFundamentals(stockCode)
        await bot.sendMessage(chatId, analysis)
      } else if (text.startsWith("/teknik ")) {
        const stockCode = text.replace("/teknik ", "").toUpperCase()
        const analysis = await commands.getTechnicalAnalysis(stockCode)
        await bot.sendMessage(chatId, analysis)
      } else if (text.startsWith("/haber ")) {
        const stockCode = text.replace("/haber ", "").toUpperCase()
        const news = await commands.getStockNews(stockCode)
        await bot.sendMessage(chatId, news)
      } else if (text.startsWith("/viop ")) {
        const symbol = text.replace("/viop ", "").toUpperCase()
        const analysis = await commands.getVIOPAnalysis(symbol)
        await bot.sendMessage(chatId, analysis)
      } else if (text.startsWith("/karsilastir ")) {
        const stocks = text.replace("/karsilastir ", "").split(" ")
        if (stocks.length >= 2) {
          const comparison = await commands.compareStocks(stocks[0], stocks[1])
          await bot.sendMessage(chatId, comparison)
        } else {
          await bot.sendMessage(chatId, "❌ İki hisse kodu girin: /karsilastir THYAO AKBNK")
        }
      } else if (text === "/bulten") {
        const bulletin = await commands.getMarketBulletin()
        await bot.sendMessage(chatId, bulletin)
      } else if (text.startsWith("/favori")) {
        await commands.handleFavorites(userId, chatId)
      } else if (text.startsWith("/favoriekle ")) {
        const stockCodes = text.replace("/favoriekle ", "").split(",")
        await commands.addFavorites(userId, chatId, stockCodes)
      } else if (text.startsWith("/favoricikar ")) {
        const stockCodes = text.replace("/favoricikar ", "").split(",")
        await commands.removeFavorites(userId, chatId, stockCodes)
      } else if (text === "/favorisifirla") {
        await commands.clearFavorites(userId, chatId)
      } else if (text.match(/^[A-Z]{3,6}$/)) {
        // Stock code pattern
        await commands.handleStockCode(userId, chatId, text)
      } else {
        // Show help message with all commands
        const helpMessage = `🤖 <b>Borsa Analiz Botu - Komut Listesi</b>

🔍 <b>Anlık ve Detaylı Veriler</b>
• /derinlik HISSE – 25 kademe anlık derinlik
• /teorik HISSE – Anlık teorik veri sorgusu  
• /akd HISSE – Aracı kurum dağılımı
• /takas HISSE – Takas analizi
• /viop SEMBOL – VIOP vadeli kontrat analizi

📈 <b>Analiz ve Karşılaştırmalar</b>
• /karsilastir HISSE1 HISSE2 – İki hissenin karşılaştırılması
• /endeksetki – Endekse etki eden hisseler

📊 <b>Finansal ve Teknik Görünümler</b>
• /temel HISSE – Şirket finansalları
• /teknik HISSE – Teknik göstergeler
• /benzer HISSE – Benzer şirketler

📰 <b>Gündem ve Bilgilendirme</b>
• /haber HISSE – KAP haberleri
• /bulten – Günlük piyasa özeti

💹 <b>Yatırım Araçları</b>
• /favori – Favori hisselerinizi görün
• /favoriekle HISSE1,HISSE2 – Favori ekleyin
• /favoricikar HISSE1,HISSE2 – Favori çıkarın
• /favorisifirla – Tüm favorileri silin

ℹ️ <b>Sadece hisse kodu gönderin!</b>
Örnek: THYAO yazıp menüden seçin.`

        await bot.sendMessage(chatId, helpMessage)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
