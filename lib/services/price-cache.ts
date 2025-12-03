// Price Cache Service - Redis-like caching layer (in-memory for demo)

import type { SymbolPrice, OracleStatus } from "@/lib/types/oracle"

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class PriceCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private defaultTTL = 1000 // 1 second TTL for price data

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Cache price for a symbol
  setPrice(symbol: string, price: SymbolPrice): void {
    this.set(`price:${symbol}`, price, 500) // 500ms TTL
  }

  getPrice(symbol: string): SymbolPrice | null {
    return this.get(`price:${symbol}`)
  }

  // Cache all prices
  setAllPrices(prices: SymbolPrice[]): void {
    this.set("prices:all", prices, 500)
    prices.forEach((price) => this.setPrice(price.symbol, price))
  }

  getAllPrices(): SymbolPrice[] | null {
    return this.get("prices:all")
  }

  // Cache oracle status
  setStatus(status: OracleStatus): void {
    this.set("oracle:status", status, 2000) // 2 second TTL
  }

  getStatus(): OracleStatus | null {
    return this.get("oracle:status")
  }

  // Get cache statistics
  getStats(): { entries: number; hitRate: number } {
    return {
      entries: this.cache.size,
      hitRate: 0.95, // Simulated hit rate
    }
  }
}

// Singleton instance
let priceCacheInstance: PriceCache | null = null

export function getPriceCache(): PriceCache {
  if (!priceCacheInstance) {
    priceCacheInstance = new PriceCache()
  }
  return priceCacheInstance
}
