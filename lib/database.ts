import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export interface User {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  is_member: boolean
  created_at: string
  updated_at: string
}

export interface UserFavorite {
  id: number
  user_id: number
  stock_code: string
  created_at: string
}

export interface Setting {
  id: number
  key: string
  value: string
  updated_at: string
}

export interface JoinRequest {
  id: number
  user_id: number
  chat_id: number
  username?: string
  first_name?: string
  last_name?: string
  bio?: string
  status: "pending" | "approved" | "declined"
  requested_at: string
  processed_at?: string
  processed_by?: number
}

export class Database {
  static async getUser(userId: number): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) return null
    return data
  }

  static async createOrUpdateUser(userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .upsert({
        id: userData.id,
        username: userData.username,
        first_name: userData.first_name,
        last_name: userData.last_name,
        is_member: userData.is_member || false,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateUserMembership(userId: number, isMember: boolean): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({
        is_member: isMember,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) throw error
  }

  static async getSetting(key: string): Promise<string | null> {
    const { data, error } = await supabase.from("settings").select("value").eq("key", key).single()

    if (error) return null
    return data.value
  }

  static async updateSetting(key: string, value: string): Promise<void> {
    const { error } = await supabase.from("settings").upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error
  }

  static async getUserFavorites(userId: number): Promise<UserFavorite[]> {
    const { data, error } = await supabase
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) return []
    return data
  }

  static async addUserFavorite(userId: number, stockCode: string): Promise<void> {
    const { error } = await supabase.from("user_favorites").insert({
      user_id: userId,
      stock_code: stockCode.toUpperCase(),
    })

    if (error && !error.message.includes("duplicate")) throw error
  }

  static async removeUserFavorite(userId: number, stockCode: string): Promise<void> {
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("stock_code", stockCode.toUpperCase())

    if (error) throw error
  }

  static async clearUserFavorites(userId: number): Promise<void> {
    const { error } = await supabase.from("user_favorites").delete().eq("user_id", userId)

    if (error) throw error
  }

  static async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) return []
    return data
  }

  static async isAdmin(userId: number): Promise<boolean> {
    const { data, error } = await supabase.from("admin_users").select("id").eq("user_id", userId).single()

    return !error && data !== null
  }

  // Join request methods
  static async createJoinRequest(requestData: Partial<JoinRequest>): Promise<JoinRequest> {
    const { data, error } = await supabase
      .from("join_requests")
      .upsert({
        user_id: requestData.user_id,
        chat_id: requestData.chat_id,
        username: requestData.username,
        first_name: requestData.first_name,
        last_name: requestData.last_name,
        bio: requestData.bio,
        status: "pending",
        requested_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getJoinRequest(userId: number, chatId: number): Promise<JoinRequest | null> {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("user_id", userId)
      .eq("chat_id", chatId)
      .single()

    if (error) return null
    return data
  }

  static async updateJoinRequestStatus(
    userId: number,
    chatId: number,
    status: "approved" | "declined",
    processedBy?: number,
  ): Promise<void> {
    const { error } = await supabase
      .from("join_requests")
      .update({
        status,
        processed_at: new Date().toISOString(),
        processed_by: processedBy,
      })
      .eq("user_id", userId)
      .eq("chat_id", chatId)

    if (error) throw error
  }

  static async getPendingJoinRequests(): Promise<JoinRequest[]> {
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("status", "pending")
      .order("requested_at", { ascending: false })

    if (error) return []
    return data
  }
}
