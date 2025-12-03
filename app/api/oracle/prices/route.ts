// GET /api/oracle/prices - Get all current prices
import { NextResponse } from "next/server"
import { getOracleManager } from "@/lib/services/oracle-manager"
import { getPriceCache } from "@/lib/services/price-cache"
import type { ApiResponse, SymbolPrice } from "@/lib/types/oracle"

export async function GET() {
  try {
    const cache = getPriceCache()
    const manager = getOracleManager()

    // Try cache first
    let prices = cache.getAllPrices()

    if (!prices) {
      // Fetch fresh prices
      prices = await manager.getAllPrices()
      cache.setAllPrices(prices)
    }

    const response: ApiResponse<SymbolPrice[]> = {
      success: true,
      data: prices,
      timestamp: Date.now(),
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch prices",
      timestamp: Date.now(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
