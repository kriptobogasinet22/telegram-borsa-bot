import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "✅ API Routes Working!",
    timestamp: new Date().toISOString(),
    message: "Next.js App Router API routes are functioning correctly",
  })
}
