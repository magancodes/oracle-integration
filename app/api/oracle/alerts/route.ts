// GET /api/oracle/alerts - Get deviation alerts
import { NextResponse } from "next/server"
import { getOracleManager } from "@/lib/services/oracle-manager"
import type { ApiResponse, DeviationAlert } from "@/lib/types/oracle"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const manager = getOracleManager()
    const alerts = manager.getAlerts(limit)

    const response: ApiResponse<DeviationAlert[]> = {
      success: true,
      data: alerts,
      timestamp: Date.now(),
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch alerts",
      timestamp: Date.now(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
