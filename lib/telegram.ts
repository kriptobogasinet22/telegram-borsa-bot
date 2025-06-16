interface TelegramUser {
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
}

interface TelegramMessage {
  message_id: number
  from?: TelegramUser
  chat: {
    id: number
    type: string
  }
  text?: string
  date: number
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
  callback_query?: {
    id: string
    from: TelegramUser
    message?: TelegramMessage
    data?: string
  }
  chat_join_request?: {
    chat: {
      id: number
      title: string
      type: string
    }
    from: TelegramUser
    date: number
    bio?: string
    invite_link?: {
      invite_link: string
    }
  }
  chat_member?: {
    chat: {
      id: number
      title: string
      type: string
    }
    from: TelegramUser
    date: number
    old_chat_member: {
      user: TelegramUser
      status: string
    }
    new_chat_member: {
      user: TelegramUser
      status: string
    }
  }
}

export class TelegramBot {
  private token: string
  private baseUrl: string

  constructor(token: string) {
    this.token = token
    this.baseUrl = `https://api.telegram.org/bot${token}`
  }

  async sendMessage(chatId: number, text: string, options: any = {}) {
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

    return response.json()
  }

  async editMessageText(chatId: number, messageId: number, text: string, options: any = {}) {
    const response = await fetch(`${this.baseUrl}/editMessageText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: "HTML",
        ...options,
      }),
    })

    return response.json()
  }

  async getChatMember(chatId: string, userId: number) {
    const response = await fetch(`${this.baseUrl}/getChatMember`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
      }),
    })

    return response.json()
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string) {
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
  }

  // Katılma isteğini onaylama
  async approveChatJoinRequest(chatId: number, userId: number) {
    const response = await fetch(`${this.baseUrl}/approveChatJoinRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
      }),
    })

    return response.json()
  }

  // Katılma isteğini reddetme
  async declineChatJoinRequest(chatId: number, userId: number) {
    const response = await fetch(`${this.baseUrl}/declineChatJoinRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        user_id: userId,
      }),
    })

    return response.json()
  }

  // Webhook ayarları - join request eventlerini almak için
  async setWebhook(url: string) {
    const response = await fetch(`${this.baseUrl}/setWebhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        allowed_updates: ["message", "callback_query", "chat_join_request", "chat_member"],
      }),
    })

    return response.json()
  }
}

export type { TelegramUpdate, TelegramMessage, TelegramUser }
