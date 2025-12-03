// Custom hooks for oracle data fetching with SWR
"use client"

import useSWR from "swr"
import type {
  SymbolPrice,
  OracleStatus,
  PriceHistory,
  DeviationAlert,
  OracleConfig,
  ApiResponse,
} from "@/lib/types/oracle"

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch")
  const data: ApiResponse<T> = await res.json()
  if (!data.success) throw new Error(data.error || "API error")
  return data.data as T
}

export function useAllPrices(refreshInterval = 1000) {
  return useSWR<SymbolPrice[]>("/api/oracle/prices", fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
  })
}

export function usePrice(symbol: string, refreshInterval = 1000) {
  const encodedSymbol = symbol.replace("/", "-")
  return useSWR<SymbolPrice>(symbol ? `/api/oracle/price/${encodedSymbol}` : null, fetcher, { refreshInterval })
}

export function useOracleHealth(refreshInterval = 2000) {
  return useSWR<OracleStatus>("/api/oracle/health", fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
  })
}

export function usePriceHistory(symbol: string, limit = 100) {
  const encodedSymbol = symbol.replace("/", "-")
  return useSWR<PriceHistory[]>(symbol ? `/api/oracle/history/${encodedSymbol}?limit=${limit}` : null, fetcher, {
    refreshInterval: 5000,
  })
}

export function useAlerts(limit = 50) {
  return useSWR<DeviationAlert[]>(`/api/oracle/alerts?limit=${limit}`, fetcher, { refreshInterval: 5000 })
}

export function useOracleConfigs() {
  return useSWR<OracleConfig[]>("/api/oracle/configs", fetcher, {
    revalidateOnFocus: false,
  })
}
