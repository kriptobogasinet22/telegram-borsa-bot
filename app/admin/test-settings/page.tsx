"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function TestSettingsPage() {
  const [testResults, setTestResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTests = async () => {
    setLoading(true)
    const results: any = {}

    try {
      // Test 1: API endpoint
      console.log("Testing API endpoint...")
      const apiResponse = await fetch("/api/admin/settings")
      const apiData = await apiResponse.json()
      results.apiTest = {
        status: apiResponse.ok ? "✅ OK" : "❌ FAIL",
        data: apiData,
      }

      // Test 2: Database direct
      console.log("Testing database...")
      const dbResponse = await fetch("/api/admin/users")
      const dbData = await dbResponse.json()
      results.dbTest = {
        status: dbResponse.ok ? "✅ OK" : "❌ FAIL",
        userCount: dbData.users?.length || 0,
      }

      // Test 3: Settings update
      console.log("Testing settings update...")
      const updateResponse = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          main_channel_id: "test_channel_id",
          invite_link: "test_invite_link",
        }),
      })
      const updateData = await updateResponse.json()
      results.updateTest = {
        status: updateResponse.ok ? "✅ OK" : "❌ FAIL",
        data: updateData,
      }

      // Test 4: Settings fetch after update
      console.log("Testing settings fetch after update...")
      const fetchResponse = await fetch("/api/admin/settings")
      const fetchData = await fetchResponse.json()
      results.fetchTest = {
        status: fetchResponse.ok ? "✅ OK" : "❌ FAIL",
        data: fetchData,
      }

      setTestResults(results)
    } catch (error) {
      console.error("Test error:", error)
      results.error = error
      setTestResults(results)
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Settings Test Panel</CardTitle>
          <CardDescription>Admin panel ayarları test et</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={loading} className="w-full">
            {loading ? "Test Ediliyor..." : "Tüm Testleri Çalıştır"}
          </Button>

          {testResults && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">API Endpoint Test:</span>
                    <Badge variant={testResults.apiTest?.status.includes("✅") ? "default" : "destructive"}>
                      {testResults.apiTest?.status}
                    </Badge>
                  </div>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(testResults.apiTest?.data, null, 2)}
                  </pre>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Database Test:</span>
                    <Badge variant={testResults.dbTest?.status.includes("✅") ? "default" : "destructive"}>
                      {testResults.dbTest?.status}
                    </Badge>
                  </div>
                  <p className="text-sm">Kullanıcı sayısı: {testResults.dbTest?.userCount}</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Settings Update Test:</span>
                    <Badge variant={testResults.updateTest?.status.includes("✅") ? "default" : "destructive"}>
                      {testResults.updateTest?.status}
                    </Badge>
                  </div>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(testResults.updateTest?.data, null, 2)}
                  </pre>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Settings Fetch Test:</span>
                    <Badge variant={testResults.fetchTest?.status.includes("✅") ? "default" : "destructive"}>
                      {testResults.fetchTest?.status}
                    </Badge>
                  </div>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(testResults.fetchTest?.data, null, 2)}
                  </pre>
                </div>
              </div>

              {testResults.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">❌ Test Hatası:</h4>
                  <pre className="text-xs text-red-700 overflow-auto">{JSON.stringify(testResults.error, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Test Adımları:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. API endpoint'i test et</li>
              <li>2. Database bağlantısını kontrol et</li>
              <li>3. Settings güncelleme test et</li>
              <li>4. Güncellenmiş ayarları getir</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
