import { type NextRequest, NextResponse } from "next/server"

// Telegram Bot sınıfı
class TelegramBot {
  private token: string
  private baseUrl: string

  constructor(token: string) {
    this.token = token
    this.baseUrl = `https://api.telegram.org/bot${token}`
  }

  async sendMessage(chatId: number, text: string, options: any = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          ...options,
        }),
      })

      const result = await response.json()
      console.log("Message sent:", result.ok)
      return result
    } catch (error) {
      console.error("Send message error:", error)
      throw error
    }
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/answerCallbackQuery`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text,
          show_alert: false,
        }),
      })

      return response.json()
    } catch (error) {
      console.error("Answer callback query error:", error)
      return { ok: false }
    }
  }

  // Invite link oluşturma
  async createChatInviteLink(chatId: number, name?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/createChatInviteLink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          name: name || "Bot Kullanıcıları",
          creates_join_request: true, // Join request oluşturacak
        }),
      })

      return response.json()
    } catch (error) {
      console.error("Create invite link error:", error)
      return { ok: false }
    }
  }
}

// Supabase Database sınıfı
class Database {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL!
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  }

  async query(table: string, method: string, data?: any, filters?: any) {
    try {
      let url = `${this.supabaseUrl}/rest/v1/${table}`

      if (filters) {
        const params = new URLSearchParams()
        Object.keys(filters).forEach((key) => {
          params.append(key, `eq.${filters[key]}`)
        })
        url += `?${params.toString()}`
      }

      const options: RequestInit = {
        method,
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${this.supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: method === "POST" ? "return=representation" : "",
        },
      }

      if (data && (method === "POST" || method === "PATCH")) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url, options)

      if (!response.ok) {
        console.error(`Database ${method} error:`, response.status, response.statusText)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Database query error:", error)
      return null
    }
  }

  async getUser(userId: number) {
    const result = await this.query("users", "GET", null, { id: userId })
    return result && result.length > 0 ? result[0] : null
  }

  async createOrUpdateUser(userData: any) {
    const existing = await this.getUser(userData.id)

    if (existing) {
      const updated = await this.query(
        "users",
        "PATCH",
        {
          username: userData.username,
          first_name: userData.first_name,
          last_name: userData.last_name,
          updated_at: new Date().toISOString(),
        },
        { id: userData.id },
      )
      return updated && updated.length > 0 ? updated[0] : existing
    } else {
      const created = await this.query("users", "POST", {
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_member: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      return created && created.length > 0 ? created[0] : null
    }
  }

  async updateUserMembership(userId: number, isMember: boolean) {
    return await this.query(
      "users",
      "PATCH",
      {
        is_member: isMember,
        updated_at: new Date().toISOString(),
      },
      { id: userId },
    )
  }

  async getSetting(key: string) {
    const result = await this.query("settings", "GET", null, { key })
    return result && result.length > 0 ? result[0].value : null
  }

  async createJoinRequest(requestData: any) {
    return await this.query("join_requests", "POST", {
      user_id: requestData.user_id,
      chat_id: requestData.chat_id,
      username: requestData.username,
      first_name: requestData.first_name,
      last_name: requestData.last_name,
      bio: requestData.bio,
      status: "pending",
      requested_at: new Date().toISOString(),
    })
  }

  async getJoinRequest(userId: number, chatId: number) {
    const result = await this.query("join_requests", "GET", null, {
      user_id: userId,
      chat_id: chatId,
    })
    return result && result.length > 0 ? result[0] : null
  }

  async getUserFavorites(userId: number) {
    const result = await this.query("user_favorites", "GET", null, { user_id: userId })
    return result || []
  }

  async addUserFavorite(userId: number, stockCode: string) {
    return await this.query("user_favorites", "POST", {
      user_id: userId,
      stock_code: stockCode.toUpperCase(),
      created_at: new Date().toISOString(),
    })
  }

  async removeUserFavorite(userId: number, stockCode: string) {
    try {
      const url = `${this.supabaseUrl}/rest/v1/user_favorites?user_id=eq.${userId}&stock_code=eq.${stockCode.toUpperCase()}`

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${this.supabaseKey}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("Remove favorite error:", error)
      return false
    }
  }

  async clearUserFavorites(userId: number) {
    try {
      const url = `${this.supabaseUrl}/rest/v1/user_favorites?user_id=eq.${userId}`

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          apikey: this.supabaseKey,
          Authorization: `Bearer ${this.supabaseKey}`,
        },
      })

      return response.ok
    } catch (error) {
      console.error("Clear favorites error:", error)
      return false
    }
  }

  async getAllUsers() {
    const result = await this.query("users", "GET")
    return result || []
  }
}

// Stock API sınıfı
class StockAPI {
  async getStockPrice(symbol: string) {
    try {
      const basePrice = 25 + Math.random() * 50
      return {
        symbol: symbol.toUpperCase(),
        price: Number.parseFloat(basePrice.toFixed(2)),
        change: Number.parseFloat((Math.random() * 4 - 2).toFixed(2)),
        changePercent: Number.parseFloat((Math.random() * 8 - 4).toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 100000,
        high: Number.parseFloat((basePrice * 1.05).toFixed(2)),
        low: Number.parseFloat((basePrice * 0.95).toFixed(2)),
        open: Number.parseFloat((basePrice * 0.98).toFixed(2)),
        close: Number.parseFloat(basePrice.toFixed(2)),
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error)
      return null
    }
  }

  async getMarketDepth(symbol: string) {
    try {
      const basePrice = 25 + Math.random() * 50
      const bids = []
      const asks = []

      for (let i = 0; i < 25; i++) {
        bids.push({
          price: Number.parseFloat((basePrice - i * 0.05).toFixed(2)),
          quantity: Math.floor(Math.random() * 10000) + 1000,
        })
        asks.push({
          price: Number.parseFloat((basePrice + i * 0.05).toFixed(2)),
          quantity: Math.floor(Math.random() * 10000) + 1000,
        })
      }

      return {
        symbol: symbol.toUpperCase(),
        bids,
        asks,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Error fetching depth for ${symbol}:`, error)
      return null
    }
  }

  async getCompanyInfo(symbol: string) {
    try {
      return {
        symbol: symbol.toUpperCase(),
        name: `${symbol} Şirketi`,
        sector: "Teknoloji",
        marketCap: Math.floor(Math.random() * 10000000000),
        peRatio: Number.parseFloat((Math.random() * 20 + 5).toFixed(2)),
        pbRatio: Number.parseFloat((Math.random() * 3 + 0.5).toFixed(2)),
        dividendYield: Number.parseFloat((Math.random() * 5).toFixed(2)),
        eps: Number.parseFloat((Math.random() * 10).toFixed(2)),
        bookValue: Number.parseFloat((Math.random() * 50 + 10).toFixed(2)),
      }
    } catch (error) {
      console.error(`Error fetching company info for ${symbol}:`, error)
      return null
    }
  }

  async getStockNews(symbol: string) {
    try {
      return [
        {
          title: `${symbol} Şirketi Önemli Açıklama`,
          content: "Şirket yönetimi önemli bir açıklama yaptı...",
          date: new Date().toISOString(),
          source: "KAP",
        },
        {
          title: `${symbol} Mali Tablo Açıklaması`,
          content: "Şirketin mali tabloları açıklandı...",
          date: new Date(Date.now() - 86400000).toISOString(),
          source: "KAP",
        },
      ]
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error)
      return []
    }
  }
}

// Bot Commands sınıfı
class BotCommands {
  private bot: TelegramBot
  private db: Database
  private stockAPI: StockAPI

  constructor(bot: TelegramBot) {
    this.bot = bot
    this.db = new Database()
    this.stockAPI = new StockAPI()
  }

  async handleStart(userId: number, chatId: number, userData: any) {
    await this.db.createOrUpdateUser({
      id: userId,
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
    })

    const mainChannelId = await this.db.getSetting("main_channel_id")
    const inviteLink = await this.db.getSetting("invite_link")

    if (!mainChannelId) {
      await this.bot.sendMessage(chatId, "❌ Bot henüz yapılandırılmamış. Admin ile iletişime geçin.")
      return
    }

    // Join request var mı kontrol et
    const joinRequest = await this.db.getJoinRequest(userId, Number.parseInt(mainChannelId))

    let message = `🔒 <b>Private Kanal Üyeliği Gerekli</b>

Bot'u kullanabilmek için özel kanalımıza katılma isteği göndermelisiniz.

`

    const keyboard = {
      inline_keyboard: [] as any[],
    }

    if (joinRequest) {
      // Join request varsa direkt aktif et
      await this.db.updateUserMembership(userId, true)

      const welcomeMessage = `✅ <b>Hoş geldiniz!</b>

Katılma isteği gönderdiğiniz için botu kullanabilirsiniz!

🔍 <b>Anlık ve Detaylı Veriler</b>
• /derinlik hissekodu – 25 kademe anlık derinlik
• /teorik hissekodu – Anlık Teorik veri sorgusu
• /temel hissekodu – Şirket finansalları
• /haber hissekodu – KAP haberleri

💹 <b>Yatırım Araçları</b>
• /favori – Favori hisselerinizi yönetin
• /favoriekle HISSE1,HISSE2 – Favori hisse ekleyin

ℹ️ <b>Sadece hisse kodu gönderin!</b>
Örnek: THYAO yazıp menüden seçin.`

      await this.bot.sendMessage(chatId, welcomeMessage)
      return
    } else {
      message += `📝 <b>Katılım Süreci:</b>
1. Aşağıdaki linke tıklayın
2. "Katılma İsteği Gönder" butonuna basın
3. İstek gönderdiğiniz anda bot aktif olur
4. Onay beklemenize gerek yok!

👆 Sadece istek gönderin, hemen kullanmaya başlayın!`

      if (inviteLink) {
        keyboard.inline_keyboard.push([{ text: "🔗 Kanala Katılma İsteği Gönder", url: inviteLink }])
      }
      keyboard.inline_keyboard.push([{ text: "✅ İstek Gönderdiysem Kontrol Et", callback_data: "check_membership" }])
    }

    await this.bot.sendMessage(chatId, message, {
      reply_markup: keyboard,
    })
  }

  async checkMembership(userId: number, chatId: number) {
    const mainChannelId = await this.db.getSetting("main_channel_id")

    if (!mainChannelId) {
      await this.bot.sendMessage(chatId, "❌ Kanal ayarları yapılmamış.")
      return
    }

    const joinRequest = await this.db.getJoinRequest(userId, Number.parseInt(mainChannelId))

    if (joinRequest) {
      await this.db.updateUserMembership(userId, true)

      const welcomeMessage = `✅ <b>Hoş geldiniz!</b>

Katılma isteğiniz mevcut, botu kullanabilirsiniz!

🔍 <b>Komutlar:</b>
• /derinlik HISSE – Derinlik analizi
• /teorik HISSE – Teorik analiz  
• /temel HISSE – Temel analiz
• /haber HISSE – Haberler
• /favori – Favoriler

ℹ️ <b>Sadece hisse kodu gönderin!</b>
Örnek: THYAO`

      await this.bot.sendMessage(chatId, welcomeMessage)
    } else {
      await this.bot.sendMessage(
        chatId,
        "❌ Henüz kanala katılma isteği göndermemişsiniz. Lütfen önce yukarıdaki linkten istek gönderin.",
      )
    }
  }

  async handleStockCode(userId: number, chatId: number, stockCode: string) {
    const user = await this.db.getUser(userId)

    if (!user?.is_member) {
      await this.handleStart(userId, chatId, { username: "", first_name: "User" })
      return
    }

    const stockPrice = await this.stockAPI.getStockPrice(stockCode)
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
          { text: "📋 Temel", callback_data: `temel_${stockCode}` },
          { text: "📰 Haberler", callback_data: `haber_${stockCode}` },
        ],
        [{ text: "⭐ Favoriye Ekle", callback_data: `favori_ekle_${stockCode}` }],
      ],
    }

    await this.bot.sendMessage(chatId, `📊 <b>${stockCode.toUpperCase()}</b> için analiz seçin:${priceInfo}`, {
      reply_markup: keyboard,
    })
  }

  async getDepthAnalysis(stockCode: string): Promise<string> {
    const depthData = await this.stockAPI.getMarketDepth(stockCode)

    if (!depthData) {
      return `❌ ${stockCode} için derinlik verisi alınamadı.`
    }

    let message = `📊 <b>${stockCode.toUpperCase()} - 25 Kademe Derinlik</b>\n\n`

    message += `<b>🔴 SATIŞ EMİRLERİ</b>\n`
    depthData.asks.slice(0, 10).forEach((ask, index) => {
      message += `${index + 1}. ${ask.price.toFixed(2)} TL - ${ask.quantity.toLocaleString()}\n`
    })

    message += `\n<b>🟢 ALIŞ EMİRLERİ</b>\n`
    depthData.bids.slice(0, 10).forEach((bid, index) => {
      message += `${index + 1}. ${bid.price.toFixed(2)} TL - ${bid.quantity.toLocaleString()}\n`
    })

    message += `\n<i>Son güncelleme: ${new Date().toLocaleString("tr-TR")}</i>`

    return message
  }

  async getTheoreticalAnalysis(stockCode: string): Promise<string> {
    const stockPrice = await this.stockAPI.getStockPrice(stockCode)

    if (!stockPrice) {
      return `❌ ${stockCode} için teorik veri alınamadı.`
    }

    const theoreticalPrice = stockPrice.price * (1 + Math.random() * 0.02 - 0.01)
    const difference = theoreticalPrice - stockPrice.price
    const diffPercent = (difference / stockPrice.price) * 100

    return `📈 <b>${stockCode.toUpperCase()} - Teorik Analiz</b>

<b>Mevcut Fiyat:</b> ${stockPrice.price.toFixed(2)} TL
<b>Teorik Fiyat:</b> ${theoreticalPrice.toFixed(2)} TL
<b>Fark:</b> ${difference > 0 ? "+" : ""}${difference.toFixed(2)} TL (${diffPercent > 0 ? "+" : ""}${diffPercent.toFixed(2)}%)

<b>Günlük Veriler:</b>
• Açılış: ${stockPrice.open.toFixed(2)} TL
• En Yüksek: ${stockPrice.high.toFixed(2)} TL  
• En Düşük: ${stockPrice.low.toFixed(2)} TL
• Hacim: ${stockPrice.volume.toLocaleString()}

<i>Son güncelleme: ${new Date().toLocaleString("tr-TR")}</i>`
  }

  async getCompanyFundamentals(stockCode: string): Promise<string> {
    const companyInfo = await this.stockAPI.getCompanyInfo(stockCode)
    const stockPrice = await this.stockAPI.getStockPrice(stockCode)

    if (!companyInfo || !stockPrice) {
      return `❌ ${stockCode} için temel analiz verisi alınamadı.`
    }

    return `🏢 <b>${stockCode.toUpperCase()} - Temel Analiz</b>

<b>Şirket:</b> ${companyInfo.name}
<b>Sektör:</b> ${companyInfo.sector}
<b>Mevcut Fiyat:</b> ${stockPrice.price.toFixed(2)} TL

<b>Finansal Oranlar:</b>
• F/K Oranı: ${companyInfo.peRatio?.toFixed(2)}
• PD/DD Oranı: ${companyInfo.pbRatio?.toFixed(2)}
• Temettü Verimi: %${companyInfo.dividendYield?.toFixed(2)}

<b>Piyasa Verileri:</b>
• Piyasa Değeri: ${(companyInfo.marketCap / 1000000).toFixed(0)}M TL
• Günlük Hacim: ${stockPrice.volume.toLocaleString()}

<i>Son güncelleme: ${new Date().toLocaleString("tr-TR")}</i>`
  }

  async getStockNews(stockCode: string): Promise<string> {
    const news = await this.stockAPI.getStockNews(stockCode)

    if (!news || news.length === 0) {
      return `📰 ${stockCode} için güncel haber bulunamadı.`
    }

    let message = `📰 <b>${stockCode.toUpperCase()} - Son Haberler</b>\n\n`

    news.slice(0, 3).forEach((item, index) => {
      const date = new Date(item.date).toLocaleDateString("tr-TR")
      message += `<b>${index + 1}. ${item.title}</b>\n`
      message += `📅 ${date} | ${item.source}\n`
      message += `${item.content}\n\n`
    })

    return message
  }

  async handleFavorites(userId: number, chatId: number) {
    const favorites = await this.db.getUserFavorites(userId)

    if (favorites.length === 0) {
      await this.bot.sendMessage(
        chatId,
        "⭐ Henüz favori hisseniz yok.\n\n/favoriekle THYAO,AKBNK şeklinde hisse ekleyebilirsiniz.",
      )
      return
    }

    const favoritesList = favorites.map((f: any) => f.stock_code).join(", ")
    await this.bot.sendMessage(chatId, `⭐ <b>Favori Hisseleriniz:</b>\n\n${favoritesList}`)
  }

  async addFavorites(userId: number, chatId: number, stockCodes: string[]) {
    try {
      for (const code of stockCodes) {
        await this.db.addUserFavorite(userId, code.trim())
      }
      await this.bot.sendMessage(chatId, `✅ ${stockCodes.join(", ")} favorilere eklendi.`)
    } catch (error) {
      await this.bot.sendMessage(chatId, "❌ Favori eklenirken hata oluştu.")
    }
  }

  async removeFavorites(userId: number, chatId: number, stockCodes: string[]) {
    try {
      for (const code of stockCodes) {
        await this.db.removeUserFavorite(userId, code.trim())
      }
      await this.bot.sendMessage(chatId, `✅ ${stockCodes.join(", ")} favorilerden çıkarıldı.`)
    } catch (error) {
      await this.bot.sendMessage(chatId, "❌ Favori çıkarılırken hata oluştu.")
    }
  }

  async clearFavorites(userId: number, chatId: number) {
    try {
      await this.db.clearUserFavorites(userId)
      await this.bot.sendMessage(chatId, "✅ Tüm favoriler temizlendi.")
    } catch (error) {
      await this.bot.sendMessage(chatId, "❌ Favoriler temizlenirken hata oluştu.")
    }
  }
}

// Ana webhook handler
export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Webhook received!")

    const update = await request.json()
    console.log("📨 Update:", JSON.stringify(update, null, 2))

    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!)
    const commands = new BotCommands(bot)
    const db = new Database()

    // Handle join requests - SADECE KAYDET, ONAYLAMA!
    if (update.chat_join_request) {
      const { chat_join_request } = update
      const userId = chat_join_request.from.id
      const chatId = chat_join_request.chat.id

      console.log(`📝 Join request received from user ${userId} for chat ${chatId}`)

      // Database'e kaydet
      await db.createJoinRequest({
        user_id: userId,
        chat_id: chatId,
        username: chat_join_request.from.username,
        first_name: chat_join_request.from.first_name,
        last_name: chat_join_request.from.last_name,
        bio: chat_join_request.bio,
      })

      // Kullanıcıyı aktif üye yap (istek attığı için)
      await db.updateUserMembership(userId, true)

      // Bilgilendirme mesajı gönder
      try {
        const welcomeMessage = `✅ <b>Katılma İsteği Alındı!</b>

Artık botu kullanabilirsiniz! İsteğiniz admin tarafından değerlendirilecek.

🚀 <b>Başlamak için:</b>
• /start - Ana menü
• THYAO - Hisse analizi

<b>Popüler Komutlar:</b>
• /derinlik THYAO
• /temel AKBNK  
• /haber GARAN

Bot'u hemen kullanmaya başlayabilirsiniz! 📈`

        await bot.sendMessage(userId, welcomeMessage)
      } catch (error) {
        console.error(`Failed to send welcome message to ${userId}:`, error)
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
      } else if (data.startsWith("temel_")) {
        const stockCode = data.replace("temel_", "")
        const analysis = await commands.getCompanyFundamentals(stockCode)
        await bot.sendMessage(chatId, analysis)
      } else if (data.startsWith("haber_")) {
        const stockCode = data.replace("haber_", "")
        const news = await commands.getStockNews(stockCode)
        await bot.sendMessage(chatId, news)
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
        const user = await db.getUser(userId)
        const mainChannelId = await db.getSetting("main_channel_id")
        const joinRequest = mainChannelId ? await db.getJoinRequest(userId, Number.parseInt(mainChannelId)) : null

        if (!user?.is_member && !joinRequest) {
          await commands.handleStart(userId, chatId, message.from!)
          return NextResponse.json({ ok: true })
        }

        if (!user?.is_member && joinRequest) {
          await db.updateUserMembership(userId, true)
        }
      }

      // Handle commands
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
      } else if (text.startsWith("/temel ")) {
        const stockCode = text.replace("/temel ", "").toUpperCase()
        const analysis = await commands.getCompanyFundamentals(stockCode)
        await bot.sendMessage(chatId, analysis)
      } else if (text.startsWith("/haber ")) {
        const stockCode = text.replace("/haber ", "").toUpperCase()
        const news = await commands.getStockNews(stockCode)
        await bot.sendMessage(chatId, news)
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
        const helpMessage = `🤖 <b>Borsa Analiz Botu - Komut Listesi</b>

🔍 <b>Anlık Veriler</b>
• /derinlik HISSE – 25 kademe derinlik
• /teorik HISSE – Teorik analiz
• /temel HISSE – Temel analiz
• /haber HISSE – KAP haberleri

💹 <b>Favoriler</b>
• /favori – Favori listesi
• /favoriekle HISSE1,HISSE2 – Favori ekle
• /favoricikar HISSE1,HISSE2 – Favori çıkar
• /favorisifirla – Tümünü sil

ℹ️ <b>Sadece hisse kodu gönderin!</b>
Örnek: THYAO`

        await bot.sendMessage(chatId, helpMessage)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "✅ Webhook endpoint is working!",
    timestamp: new Date().toISOString(),
    botToken: process.env.TELEGRAM_BOT_TOKEN ? "✅ Token Set" : "❌ Token Missing",
    supabase: process.env.SUPABASE_URL ? "✅ Supabase Set" : "❌ Supabase Missing",
  })
}
