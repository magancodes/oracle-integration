// Oracle Integration Types - Matching the Rust/Anchor program structures

export enum PriceSource {
  Pyth = "Pyth",
  Switchboard = "Switchboard",
  Internal = "Internal",
}

export interface PriceData {
  price: number
  confidence: number
  expo: number
  timestamp: number
  source: PriceSource
}

export interface OracleConfig {
  symbol: string
  pythFeed: string
  switchboardAggregator: string
  maxStaleness: number // seconds
  maxConfidence: number // basis points
  maxDeviation: number // basis points
}

export interface SymbolPrice {
  symbol: string
  price: number
  confidence: number
  timestamp: number
  sources: PriceData[]
  consensusPrice: number
  deviation: number
  isValid: boolean
  staleness: number
}

export interface OracleHealth {
  source: PriceSource
  status: "healthy" | "degraded" | "offline"
  latency: number
  lastUpdate: number
  successRate: number
  errorCount: number
}

export interface PriceHistory {
  symbol: string
  timestamp: number
  price: number
  source: PriceSource
  confidence: number
}

export interface OracleStatus {
  overallStatus: "operational" | "degraded" | "critical"
  uptime: number
  totalSymbols: number
  activeFeeds: number
  sources: OracleHealth[]
  lastUpdate: number
}

export interface DeviationAlert {
  id: string
  symbol: string
  timestamp: number
  deviation: number
  sources: { source: PriceSource; price: number }[]
  severity: "warning" | "critical"
  resolved: boolean
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

// WebSocket message types
export interface PriceUpdate {
  type: "price_update"
  symbol: string
  data: SymbolPrice
}

export interface HealthUpdate {
  type: "health_update"
  data: OracleStatus
}

export interface AlertNotification {
  type: "alert"
  data: DeviationAlert
}

export type WebSocketMessage = PriceUpdate | HealthUpdate | AlertNotification
