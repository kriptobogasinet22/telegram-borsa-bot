"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, Send, CableIcon as Channel } from "lucide-react"

interface User {
  id: number
  username?: string
  first_name?: string
  last_name?: string
  is_member: boolean
  created_at: string
}

interface AdminSettings {
  main_channel_link: string
  main_channel_id: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<AdminSettings>({
    main_channel_link: "",
    main_channel_id: "",
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
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const updateSettings = async () => {
    setLoading(true)
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      alert("Ayarlar güncellendi!")
    } catch (error) {
      alert("Hata oluştu!")
    }
    setLoading(false)
  }

  const sendAnnouncement = async () => {
    if (!announcement.trim()) {
      alert("Duyuru metni boş olamaz!")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: announcement }),
      })

      const result = await response.json()
      alert(`Duyuru gönderildi! ${result.sent} kullanıcıya ulaştı.`)
      setAnnouncement("")
    } catch (error) {
      alert("Duyuru gönderilirken hata oluştu!")
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Admin Panel</h1>
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
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
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
              <CardTitle>Bot Ayarları</CardTitle>
              <CardDescription>Ana kanal linkini ve diğer bot ayarlarını yönetin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channel-link">Ana Kanal Linki</Label>
                <Input
                  id="channel-link"
                  placeholder="@your_channel"
                  value={settings.main_channel_link}
                  onChange={(e) => setSettings({ ...settings, main_channel_link: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="channel-id">Ana Kanal ID</Label>
                <Input
                  id="channel-id"
                  placeholder="-1001234567890"
                  value={settings.main_channel_id}
                  onChange={(e) => setSettings({ ...settings, main_channel_id: e.target.value })}
                />
              </div>

              <Button onClick={updateSettings} disabled={loading}>
                {loading ? "Güncelleniyor..." : "Ayarları Güncelle"}
              </Button>
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
