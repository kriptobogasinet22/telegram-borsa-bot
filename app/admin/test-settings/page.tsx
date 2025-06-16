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
      console.log("🧪 Testing API endpoint...")
      try {
        const apiResponse = await fetch("/api/admin/settings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("API Response status:", apiResponse.status)
        console.log("API Response ok:", apiResponse.ok)

        const apiData = await apiResponse.json()
        console.log("API Response data:", apiData)

        results.apiTest = {
          status: apiResponse.ok ? "✅ OK" : "❌ FAIL",
          statusCode: apiResponse.status,
          data: apiData,
        }
      } catch (error) {
        console.error("API Test Error:", error)
        results.apiTest = {
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }

      // Test 2: Database direct
      console.log("🧪 Testing database...")
      try {
        const dbResponse = await fetch("/api/admin/users", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("DB Response status:", dbResponse.status)

        const dbData = await dbResponse.json()
        console.log("DB Response data:", dbData)

        results.dbTest = {
          status: dbResponse.ok ? "✅ OK" : "❌ FAIL",
          statusCode: dbResponse.status,
          userCount: dbData.users?.length || 0,
          data: dbData,
        }
      } catch (error) {
        console.error("DB Test Error:", error)
        results.dbTest = {
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }

      // Test 3: Environment variables
      console.log("🧪 Testing environment...")
      try {
        const envResponse = await fetch("/api/webhook", {
          method: "GET",
        })

        const envData = await envResponse.json()
        console.log("Env Response data:", envData)

        results.envTest = {
          status: envResponse.ok ? "✅ OK" : "❌ FAIL",
          data: envData,
        }
      } catch (error) {
        console.error("Env Test Error:", error)
        results.envTest = {
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }

      // Test 4: Settings update
      console.log("🧪 Testing settings update...")
      try {
        const testChannelId = `test_${Date.now()}`
        const testInviteLink = `https://t.me/+test_${Date.now()}`

        const updateResponse = await fetch("/api/admin/settings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            main_channel_id: testChannelId,
            invite_link: testInviteLink,
          }),
        })

        console.log("Update Response status:", updateResponse.status)

        const updateData = await updateResponse.json()
        console.log("Update Response data:", updateData)

        results.updateTest = {
          status: updateResponse.ok ? "✅ OK" : "❌ FAIL",
          statusCode: updateResponse.status,
          sentData: { testChannelId, testInviteLink },
          data: updateData,
        }
      } catch (error) {
        console.error("Update Test Error:", error)
        results.updateTest = {
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }

      // Test 5: Settings fetch after update
      console.log("🧪 Testing settings fetch after update...")
      try {
        // Kısa bir bekleme
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const fetchResponse = await fetch("/api/admin/settings?" + new Date().getTime(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Fetch Response status:", fetchResponse.status)

        const fetchData = await fetchResponse.json()
        console.log("Fetch Response data:", fetchData)

        results.fetchTest = {
          status: fetchResponse.ok ? "✅ OK" : "❌ FAIL",
          statusCode: fetchResponse.status,
          data: fetchData,
        }
      } catch (error) {
        console.error("Fetch Test Error:", error)
        results.fetchTest = {
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }

      console.log("🎯 All tests completed:", results)
      setTestResults(results)
    } catch (error) {
      console.error("❌ Global test error:", error)
      setTestResults({
        globalError: {
          status: "❌ GLOBAL ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
      })
    }

    setLoading(false)
  }

  const testSingleEndpoint = async (endpoint: string, method = "GET") => {
    try {
      console.log(`Testing ${method} ${endpoint}...`)
      const response = await fetch(endpoint, { method })
      const data = await response.json()

      alert(`${endpoint}\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      alert(`Error testing ${endpoint}: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Settings Test Panel</CardTitle>
          <CardDescription>Admin panel ayarları detaylı test et</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button onClick={runTests} disabled={loading} className="w-full">
              {loading ? "Test Ediliyor..." : "🚀 Tüm Testleri Çalıştır"}
            </Button>
            <Button onClick={() => testSingleEndpoint("/api/admin/settings")} variant="outline" className="w-full">
              📊 Settings API Test
            </Button>
            <Button onClick={() => testSingleEndpoint("/api/admin/users")} variant="outline" className="w-full">
              👥 Users API Test
            </Button>
          </div>

          {testResults && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {/* API Test */}
                {testResults.apiTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">📊 API Endpoint Test:</span>
                      <Badge variant={testResults.apiTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.apiTest.status}{" "}
                        {testResults.apiTest.statusCode && `(${testResults.apiTest.statusCode})`}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.apiTest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Database Test */}
                {testResults.dbTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">🗄️ Database Test:</span>
                      <Badge variant={testResults.dbTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.dbTest.status}{" "}
                        {testResults.dbTest.statusCode && `(${testResults.dbTest.statusCode})`}
                      </Badge>
                    </div>
                    <p className="text-sm mb-2">Kullanıcı sayısı: {testResults.dbTest.userCount}</p>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.dbTest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Environment Test */}
                {testResults.envTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">🌍 Environment Test:</span>
                      <Badge variant={testResults.envTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.envTest.status}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.envTest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Update Test */}
                {testResults.updateTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">📝 Settings Update Test:</span>
                      <Badge variant={testResults.updateTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.updateTest.status}{" "}
                        {testResults.updateTest.statusCode && `(${testResults.updateTest.statusCode})`}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.updateTest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Fetch Test */}
                {testResults.fetchTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">🔄 Settings Fetch Test:</span>
                      <Badge variant={testResults.fetchTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.fetchTest.status}{" "}
                        {testResults.fetchTest.statusCode && `(${testResults.fetchTest.statusCode})`}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.fetchTest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Global Error */}
                {testResults.globalError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-red-800">❌ Global Error:</span>
                      <Badge variant="destructive">{testResults.globalError.status}</Badge>
                    </div>
                    <pre className="text-xs text-red-700 overflow-auto max-h-32">
                      {JSON.stringify(testResults.globalError, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Test Adımları:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. 📊 API endpoint'i test et</li>
              <li>2. 🗄️ Database bağlantısını kontrol et</li>
              <li>3. 🌍 Environment variables kontrol et</li>
              <li>4. 📝 Settings güncelleme test et</li>
              <li>5. 🔄 Güncellenmiş ayarları getir</li>
            </ol>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">🔍 Debug Bilgileri:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Browser Console'u açık tutun (F12)</li>
              <li>• Network tab'ında istekleri kontrol edin</li>
              <li>• Vercel logs'ları kontrol edin</li>
              <li>• Environment variables set mi kontrol edin</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
