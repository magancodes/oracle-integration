// GET /api/oracle/history/:symbol - Get price history for a symbol
import { NextResponse } from "next/server"
import { getOracleManager } from "@/lib/services/oracle-manager"
import type { ApiResponse, PriceHistory } from "@/lib/types/oracle"

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol } = await params
    const decodedSymbol = decodeURIComponent(symbol).replace("-", "/")

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    const manager = getOracleManager()
    const history = manager.getPriceHistory(decodedSymbol, limit)

    const response: ApiResponse<PriceHistory[]> = {
      success: true,
      data: history,
      timestamp: Date.now(),
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch history",
      timestamp: Date.now(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
