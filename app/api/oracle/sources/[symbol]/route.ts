// GET /api/oracle/sources/:symbol - Get source prices for a symbol
import { NextResponse } from "next/server"
import { getOracleManager } from "@/lib/services/oracle-manager"
import type { ApiResponse } from "@/lib/types/oracle"

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol } = await params
    const decodedSymbol = decodeURIComponent(symbol).replace("-", "/")

    const manager = getOracleManager()
    const price = await manager.getPrice(decodedSymbol)

    if (!price) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Symbol ${decodedSymbol} not found`,
        timestamp: Date.now(),
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<{ symbol: string; sources: typeof price.sources }> = {
      success: true,
      data: {
        symbol: price.symbol,
        sources: price.sources,
      },
      timestamp: Date.now(),
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch sources",
      timestamp: Date.now(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
