// GET /api/oracle/price/:symbol - Get price for specific symbol
import { NextResponse } from "next/server"
import { getOracleManager } from "@/lib/services/oracle-manager"
import { getPriceCache } from "@/lib/services/price-cache"
import type { ApiResponse, SymbolPrice } from "@/lib/types/oracle"

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  try {
    const { symbol } = await params
    const decodedSymbol = decodeURIComponent(symbol).replace("-", "/")

    const cache = getPriceCache()
    const manager = getOracleManager()

    // Try cache first
    let price = cache.getPrice(decodedSymbol)

    if (!price) {
      price = await manager.getPrice(decodedSymbol)
      if (price) {
        cache.setPrice(decodedSymbol, price)
      }
    }

    if (!price) {
      const response: ApiResponse<null> = {
        success: false,
        error: `Symbol ${decodedSymbol} not found`,
        timestamp: Date.now(),
      }
      return NextResponse.json(response, { status: 404 })
    }

    const response: ApiResponse<SymbolPrice> = {
      success: true,
      data: price,
      timestamp: Date.now(),
    }

    return NextResponse.json(response)
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch price",
      timestamp: Date.now(),
    }
    return NextResponse.json(response, { status: 500 })
  }
}
