// GET /api/oracle/configs - Get oracle configurations
import { NextResponse } from "next/server"
import { getOracleManager } from "@/lib/services/oracle-manager"
import type { ApiResponse, OracleConfig } from "@/lib/types/oracle"

export async function GET() {
  try {
    const manager = getOracleManager()
    const configs = manager.getConfigs()

    const response: ApiResponse<OracleConfig[]> = {
      success: true,
      data: configs,
      timestamp: Date.now(),
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch configs",
      timestamp: Date.now(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
