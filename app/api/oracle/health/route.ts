// GET /api/oracle/health - Get oracle system health status
import { NextResponse } from "next/server"
import { getOracleManager } from "@/lib/services/oracle-manager"
import { getPriceCache } from "@/lib/services/price-cache"
import type { ApiResponse, OracleStatus } from "@/lib/types/oracle"

export async function GET() {
  try {
    const cache = getPriceCache()
    const manager = getOracleManager()

    // Try cache first
    let status = cache.getStatus()

    if (!status) {
      status = manager.getOracleStatus()
      cache.setStatus(status)
    }

    const response: ApiResponse<OracleStatus> = {
      success: true,
      data: status,
      timestamp: Date.now(),
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch health",
      timestamp: Date.now(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
