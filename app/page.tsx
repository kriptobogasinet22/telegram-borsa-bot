import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, TrendingUp, Users, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Bot className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Borsa Analiz Botu</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Telegram üzerinden kapsamlı borsa analizi, derinlik verileri ve hisse takibi
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>Anlık Veriler</CardTitle>
              <CardDescription>25 kademe derinlik, teorik fiyat ve AKD analizleri</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>Kolay Kullanım</CardTitle>
              <CardDescription>Sadece hisse kodu gönderin, menüden analizi seçin</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>Güvenli Erişim</CardTitle>
              <CardDescription>Kanal üyeliği kontrolü ile güvenli bot kullanımı</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/admin">
            <Button size="lg" className="mr-4">
              Admin Panel
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Telegram Botu Başlat
          </Button>
        </div>

        <div className="mt-16 bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Bot Komutları</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-3">🔍 Anlık Veriler</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• /derinlik HISSE - 25 kademe derinlik</li>
                <li>• /teorik HISSE - Teorik fiyat analizi</li>
                <li>• /akd HISSE - Aracı kurum dağılımı</li>
                <li>• /takas HISSE - Takas analizi</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">📈 Analiz Araçları</h3>
              <ul className="space-y-1 text-gray-600">
                <li>• /temel HISSE - Finansal veriler</li>
                <li>• /teknik HISSE - Teknik analiz</li>
                <li>• /haber HISSE - KAP haberleri</li>
                <li>• /favori - Favori hisseler</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
