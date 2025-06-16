import { Database } from "./database"
import type { TelegramBot } from "./telegram"
import { stockAPI } from "./stock-api"

export class BotCommands {
  private bot: TelegramBot

  constructor(bot: TelegramBot) {
    this.bot = bot
  }

  async handleStart(userId: number, chatId: number, userData: any) {
    await Database.createOrUpdateUser({
      id: userId,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      is_member: false,
    })

    const mainChannelLink = await Database.getSetting("main_channel_link")
    const mainChannelId = await Database.getSetting("main_channel_id")

    // Join request durumunu kontrol et
    const joinRequest = mainChannelId ? await Database.getJoinRequest(userId, Number.parseInt(mainChannelId)) : null

    let message = `🚫 Bot'u kullanabilmek için kanalımıza katılma isteği göndermelisiniz:\n\n• <b>Ana Kanal</b> - ${mainChannelLink}\n\n`

    const keyboard = {
      inline_keyboard: [] as any[],
    }

    if (joinRequest) {
      // İstek gönderilmişse direkt aktif et
      await Database.updateUserMembership(userId, true)

      const welcomeMessage = `✅ <b>Hoş geldiniz!</b>

Katılma isteği gönderdiğiniz için botu kullanabilirsiniz!

🔍 <b>Anlık ve Detaylı Veriler</b>
• /derinlik hissekodu – 25 kademe anlık derinlik
• /teorik hissekodu – Anlık Teorik veri sorgusu
• /akd hissekodu – Aracı kurum dağılımı
• /takas hissekodu – Takas analizi
• /viop sembolkodu – VIOP vadeli kontrat analizi

📈 <b>Analiz ve Karşılaştırmalar</b>
• /karsilastir hissekodu1 hissekodu2 – İki hissenin karşılaştırılması

📊 <b>Finansal ve Teknik Görünümler</b>
• /temel hissekodu – Şirket finansalları
• /teknik hissekodu – Teknik göstergeler

📰 <b>Gündem ve Bilgilendirme</b>
• /haber hissekodu – KAP haberleri
• /bulten – Günlük piyasa özeti

💹 <b>Yatırım Araçları</b>
• /favori – Favori hisselerinizi yönetin
• /favoriekle HISSE1,HISSE2 – Favori hisse ekleyin

ℹ️ <b>Sadece hisse kodu gönderin!</b>
Örnek: THYAO yazıp menüden seçin.`

      await this.bot.sendMessage(chatId, welcomeMessage)
      return
    } else {
      message += `👆 Kanala katılma isteği gönderin, istek gönderdiğiniz anda botu kullanabilirsiniz.`
      keyboard.inline_keyboard.push([
        { text: "🔗 Katılma İsteği Gönder", url: `https://t.me/${mainChannelLink?.replace("@", "")}` },
      ])
      keyboard.inline_keyboard.push([{ text: "✅ İstek Gönderdiysem Kontrol Et", callback_data: "check_membership" }])
    }

    await this.bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
    })
  }

  async checkMembership(userId: number, chatId: number) {
    const mainChannelId = await Database.getSetting("main_channel_id")

    if (!mainChannelId) {
      await this.bot.sendMessage(chatId, "❌ Kanal ayarları yapılmamış.")
      return
    }

    // Join request var mı kontrol et
    const joinRequest = await Database.getJoinRequest(userId, Number.parseInt(mainChannelId))

    if (joinRequest) {
      // İstek varsa direkt aktif et
      await Database.updateUserMembership(userId, true)

      const welcomeMessage = `✅ <b>Hoş geldiniz!</b>

Katılma isteğiniz mevcut, botu kullanabilirsiniz!

🔍 <b>Komutlar:</b>
• /derinlik HISSE – Derinlik analizi
• /teorik HISSE – Teorik analiz  
• /temel HISSE – Temel analiz
• /teknik HISSE – Teknik analiz
• /haber HISSE – Haberler
• /bulten – Piyasa özeti
• /favori – Favoriler

ℹ️ <b>Sadece hisse kodu gönderin!</b>
Örnek: THYAO`

      await this.bot.sendMessage(chatId, welcomeMessage)
    } else {
      await this.bot.sendMessage(chatId, "❌ Henüz kanala katılma isteği göndermemişsiniz. Lütfen önce istek gönderin.")
    }
  }

  // Diğer metodlar aynı kalacak...
  async handleStockCode(userId: number, chatId: number, stockCode: string) {
    const user = await Database.getUser(userId)

    if (!user?.is_member) {
      await this.handleStart(userId, chatId, { username: "", first_name: "User" })
      return
    }

    const stockPrice = await stockAPI.getStockPrice(stockCode)
    const priceInfo = stockPrice
      ? `\n💰 Mevcut: ${stockPrice.price.toFixed(2)} TL (${stockPrice.change > 0 ? "+" : ""}${stockPrice.changePercent.toFixed(2)}%)`
      : ""

    const keyboard = {
      inline_keyboard: [
        [
          { text: "📊 Derinlik", callback_data: `derinlik_${stockCode}` },
          { text: "📈 Teorik", callback_data: `teorik_${stockCode}` },
        ],
        [
          { text: "🏢 AKD", callback_data: `akd_${stockCode}` },
          { text: "💱 Takas", callback_data: `takas_${stockCode}` },
        ],
        [
          { text: "📋 Temel", callback_data: `temel_${stockCode}` },
          { text: "📊 Teknik", callback_data: `teknik_${stockCode}` },
        ],
        [
          { text: "📰 Haberler", callback_data: `haber_${stockCode}` },
          { text: "📈 VIOP", callback_data: `viop_${stockCode}` },
        ],
        [
          { text: "⭐ Favoriye Ekle", callback_data: `favori_ekle_${stockCode}` },
          { text: "🔄 Yenile", callback_data: `yenile_${stockCode}` },
        ],
      ],
    }

    await this.bot.sendMessage(chatId, `📊 <b>${stockCode.toUpperCase()}</b> için analiz seçin:${priceInfo}`, {
      reply_markup: keyboard,
    })
  }

  // Diğer tüm metodlar aynı kalacak (getDepthAnalysis, getTechnicalAnalysis, vs.)
}
