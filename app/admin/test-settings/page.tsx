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
      // Test 0: Basic API test
      console.log("🧪 Testing basic API...")
      try {
        const basicResponse = await fetch("/api/test")
        console.log("Basic API Response status:", basicResponse.status)
        console.log("Basic API Response headers:", Object.fromEntries(basicResponse.headers.entries()))

        if (basicResponse.ok) {
          const basicData = await basicResponse.json()
          console.log("Basic API Response data:", basicData)
          results.basicTest = {
            status: "✅ OK",
            statusCode: basicResponse.status,
            data: basicData,
          }
        } else {
          const basicText = await basicResponse.text()
          console.log("Basic API Response text:", basicText.substring(0, 200))
          results.basicTest = {
            status: "❌ FAIL",
            statusCode: basicResponse.status,
            responseText: basicText.substring(0, 200),
          }
        }
      } catch (error) {
        console.error("Basic API Test Error:", error)
        results.basicTest = {
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }

      // Test 1: Settings API endpoint
      console.log("🧪 Testing Settings API endpoint...")
      try {
        const apiResponse = await fetch("/api/admin/settings")
        console.log("Settings API Response status:", apiResponse.status)
        console.log("Settings API Response headers:", Object.fromEntries(apiResponse.headers.entries()))

        if (apiResponse.ok) {
          const apiData = await apiResponse.json()
          console.log("Settings API Response data:", apiData)
          results.settingsTest = {
            status: "✅ OK",
            statusCode: apiResponse.status,
            data: apiData,
          }
        } else {
          const apiText = await apiResponse.text()
          console.log("Settings API Response text:", apiText.substring(0, 200))
          results.settingsTest = {
            status: "❌ FAIL",
            statusCode: apiResponse.status,
            responseText: apiText.substring(0, 200),
          }
        }
      } catch (error) {
        console.error("Settings API Test Error:", error)
        results.settingsTest = {
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }

      // Test 2: Users API endpoint
      console.log("🧪 Testing Users API endpoint...")
      try {
        const usersResponse = await fetch("/api/admin/users")
        console.log("Users API Response status:", usersResponse.status)

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          console.log("Users API Response data:", usersData)
          results.usersTest = {
            status: "✅ OK",
            statusCode: usersResponse.status,
            data: usersData,
          }
        } else {
          const usersText = await usersResponse.text()
          console.log("Users API Response text:", usersText.substring(0, 200))
          results.usersTest = {
            status: "❌ FAIL",
            statusCode: usersResponse.status,
            responseText: usersText.substring(0, 200),
          }
        }
      } catch (error) {
        console.error("Users API Test Error:", error)
        results.usersTest = {
          status: "❌ ERROR",
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }

      // Test 3: Webhook endpoint
      console.log("🧪 Testing Webhook endpoint...")
      try {
        const webhookResponse = await fetch("/api/webhook")
        console.log("Webhook Response status:", webhookResponse.status)

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json()
          console.log("Webhook Response data:", webhookData)
          results.webhookTest = {
            status: "✅ OK",
            statusCode: webhookResponse.status,
            data: webhookData,
          }
        } else {
          const webhookText = await webhookResponse.text()
          console.log("Webhook Response text:", webhookText.substring(0, 200))
          results.webhookTest = {
            status: "❌ FAIL",
            statusCode: webhookResponse.status,
            responseText: webhookText.substring(0, 200),
          }
        }
      } catch (error) {
        console.error("Webhook Test Error:", error)
        results.webhookTest = {
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

  const testDirectPath = async (path: string) => {
    try {
      console.log(`Testing direct path: ${path}`)
      const response = await fetch(path)
      console.log(`Response status: ${response.status}`)
      console.log(`Response headers:`, Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        alert(`✅ ${path}\nStatus: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`)
      } else {
        const text = await response.text()
        alert(`❌ ${path}\nStatus: ${response.status}\nResponse: ${text.substring(0, 300)}`)
      }
    } catch (error) {
      alert(`❌ Error testing ${path}: ${error}`)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 API Routes Test Panel</CardTitle>
          <CardDescription>Next.js App Router API routes test et</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button onClick={runTests} disabled={loading} className="w-full">
              {loading ? "Test Ediliyor..." : "🚀 Tüm Testleri Çalıştır"}
            </Button>
            <Button onClick={() => testDirectPath("/api/test")} variant="outline" className="w-full">
              🔧 Basic API Test
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button onClick={() => testDirectPath("/api/admin/settings")} variant="outline" className="w-full">
              📊 Settings API
            </Button>
            <Button onClick={() => testDirectPath("/api/admin/users")} variant="outline" className="w-full">
              👥 Users API
            </Button>
          </div>

          {testResults && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {/* Basic Test */}
                {testResults.basicTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">🔧 Basic API Test:</span>
                      <Badge variant={testResults.basicTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.basicTest.status}{" "}
                        {testResults.basicTest.statusCode && `(${testResults.basicTest.statusCode})`}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.basicTest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Settings Test */}
                {testResults.settingsTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">📊 Settings API Test:</span>
                      <Badge variant={testResults.settingsTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.settingsTest.status}{" "}
                        {testResults.settingsTest.statusCode && `(${testResults.settingsTest.statusCode})`}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.settingsTest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Users Test */}
                {testResults.usersTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">👥 Users API Test:</span>
                      <Badge variant={testResults.usersTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.usersTest.status}{" "}
                        {testResults.usersTest.statusCode && `(${testResults.usersTest.statusCode})`}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.usersTest, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Webhook Test */}
                {testResults.webhookTest && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">🔗 Webhook Test:</span>
                      <Badge variant={testResults.webhookTest.status.includes("✅") ? "default" : "destructive"}>
                        {testResults.webhookTest.status}{" "}
                        {testResults.webhookTest.statusCode && `(${testResults.webhookTest.statusCode})`}
                      </Badge>
                    </div>
                    <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(testResults.webhookTest, null, 2)}
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
            <h4 className="font-medium text-blue-800 mb-2">🔧 Sorun Giderme:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. 🔧 Basic API test çalışıyor mu?</li>
              <li>2. 📁 API dosyaları app/api/ klasöründe mi?</li>
              <li>3. 🚀 Vercel'e deploy edildi mi?</li>
              <li>4. 🌍 Environment variables set mi?</li>
            </ol>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">📁 Dosya Yapısı:</h4>
            <pre className="text-xs text-yellow-700">
              {`app/
├── api/
│   ├── test/route.ts
│   ├── webhook/route.ts
│   └── admin/
│       ├── settings/route.ts
│       ├── users/route.ts
│       ├── announcement/route.ts
│       └── create-invite/route.ts
└── admin/
    └── test-settings/page.tsx`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
