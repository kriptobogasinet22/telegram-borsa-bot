"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, Send, CableIcon as Channel, LinkIcon } from "lucide-react"

interface User {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  is_member: boolean
  created_at: string
}

interface AdminSettings {
  main_channel_id: string
  invite_link: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<AdminSettings>({
    main_channel_id: "",
    invite_link: "",
  })
  const [announcement, setAnnouncement] = useState("")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMembers: 0,
    newUsersToday: 0,
  })

  useEffect(() => {
    fetchUsers()
    fetchSettings()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      setUsers(data.users)

      const totalUsers = data.users.length
      const activeMembers = data.users.filter((u: User) => u.is_member).length
      const today = new Date().toDateString()
      const newUsersToday = data.users.filter((u: User) => new Date(u.created_at).toDateString() === today).length

      setStats({ totalUsers, activeMembers, newUsersToday })
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      console.log("Fetching settings...")
      const response = await fetch("/api/admin/settings")
      const data = await response.json()

      console.log("Settings response:", data)

      if (response.ok && data.settings) {
        setSettings({
          main_channel_id: data.settings.main_channel_id || "",
          invite_link: data.settings.invite_link || "",
        })
      } else {
        console.error("Settings fetch error:", data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const updateSettings = async () => {
    setLoading(true)
    try {
      console.log("Sending settings:", settings)

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          main_channel_id: settings.main_channel_id,
          invite_link: settings.invite_link,
        }),
      })

      const result = await response.json()
      console.log("Settings update result:", result)

      if (response.ok) {
        alert("✅ Ayarlar başarıyla güncellendi!")
        await fetchSettings() // Ayarları yeniden yükle
      } else {
        alert(`❌ Hata: ${result.error || "Bilinmeyen hata"}`)
      }
    } catch (error) {
      console.error("Settings update error:", error)
      alert("❌ Ayarlar güncellenirken hata oluştu!")
    }
    setLoading(false)
  }

  const createInviteLink = async () => {
    if (!settings.main_channel_id) {
      alert("Önce kanal ID'sini girin!")
      return
    }

    setLoading(true)
    try {
      console.log("Creating invite link for channel:", settings.main_channel_id)

      const response = await fetch("/api/admin/create-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: settings.main_channel_id }),
      })

      const result = await response.json()
      console.log("Create invite result:", result)

      if (response.ok && result.invite_link) {
        // Ayarları güncelle
        const newSettings = { ...settings, invite_link: result.invite_link }
        setSettings(newSettings)

        // Database'e kaydet
        await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSettings),
        })

        alert("✅ Davet linki oluşturuldu!")
      } else {
        alert(`❌ Hata: ${result.error || "Davet linki oluşturulamadı"}`)
      }
    } catch (error) {
      console.error("Create invite link error:", error)
      alert("❌ Davet linki oluşturulurken hata oluştu!")
    }
    setLoading(false)
  }

  const sendAnnouncement = async () => {
    if (!announcement.trim()) {
      alert("Duyuru metni boş olamaz!")
      return
    }

    if (!confirm(`${stats.totalUsers} kullanıcıya duyuru gönderilecek. Emin misiniz?`)) {
      return
    }

    setLoading(true)
    try {
      console.log("Sending announcement to", stats.totalUsers, "users")

      const response = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: announcement }),
      })

      const result = await response.json()
      console.log("Announcement result:", result)

      if (response.ok) {
        alert(
          `✅ Duyuru gönderildi!\n• Başarılı: ${result.sent}\n• Başarısız: ${result.failed || 0}\n• Toplam: ${result.total}`,
        )
        setAnnouncement("")
      } else {
        alert(`❌ Hata: ${result.error || "Duyuru gönderilemedi"}`)
      }
    } catch (error) {
      console.error("Announcement error:", error)
      alert("❌ Duyuru gönderilirken hata oluştu!")
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Admin Panel - Private Kanal</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Üyeler</CardTitle>
            <Channel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugünkü Yeni Üyeler</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersToday}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="settings">Private Kanal Ayarları</TabsTrigger>
          <TabsTrigger value="announcement">Duyuru</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Kullanıcı Listesi</CardTitle>
              <CardDescription>Botu kullanan tüm kullanıcılar ve üyelik durumları</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                        {user.username && <span className="text-muted-foreground ml-2">@{user.username}</span>}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {user.id} • {new Date(user.created_at).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                    <Badge variant={user.is_member ? "default" : "secondary"}>
                      {user.is_member ? "Üye" : "Üye Değil"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Private Kanal Ayarları</CardTitle>
              <CardDescription>Private kanal için özel davet linki oluşturun ve ayarları yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">🔒 Private Kanal Kurulumu:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                  <li>1. Bot'u kanalınıza admin olarak ekleyin</li>
                  <li>2. Kanal ID'sini aşağıya girin</li>
                  <li>3. "Davet Linki Oluştur" butonuna tıklayın</li>
                  <li>4. Ayarları kaydedin</li>
                </ol>
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel-id">Kanal ID</Label>
                <Input
                  id="channel-id"
                  placeholder="-1001234567890"
                  value={settings.main_channel_id}
                  onChange={(e) => setSettings({ ...settings, main_channel_id: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-link">Davet Linki</Label>
                <div className="flex gap-2">
                  <Input
                    id="invite-link"
                    placeholder="https://t.me/+xxxxx"
                    value={settings.invite_link}
                    onChange={(e) => setSettings({ ...settings, invite_link: e.target.value })}
                    readOnly
                  />
                  <Button onClick={createInviteLink} disabled={loading} variant="outline">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Oluştur
                  </Button>
                </div>
              </div>

              <Button onClick={updateSettings} disabled={loading} className="w-full">
                {loading ? "Güncelleniyor..." : "Ayarları Kaydet"}
              </Button>

              {settings.invite_link && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ Davet Linki Hazır!</h4>
                  <p className="text-sm text-green-700">
                    Bu link ile kullanıcılar kanala katılma isteği gönderebilir. İstekler otomatik onaylanacak.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcement">
          <Card>
            <CardHeader>
              <CardTitle>Toplu Duyuru Gönder</CardTitle>
              <CardDescription>Tüm bot kullanıcılarına duyuru gönderin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement">Duyuru Metni</Label>
                <Textarea
                  id="announcement"
                  placeholder="Duyuru metnini buraya yazın..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  rows={6}
                />
              </div>

              <Button onClick={sendAnnouncement} disabled={loading || !announcement.trim()}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? "Gönderiliyor..." : `${stats.totalUsers} Kullanıcıya Gönder`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
