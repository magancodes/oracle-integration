"use client"

import { useEffect, useState, useCallback } from "react"
import type { SymbolPrice, OracleStatus, DeviationAlert } from "@/lib/types/oracle"

interface RealtimeData {
  prices: SymbolPrice[]
  health: OracleStatus | null
  alerts: DeviationAlert[]
  connected: boolean
  error: string | null
}

export function useRealtimePrices() {
  const [data, setData] = useState<RealtimeData>({
    prices: [],
    health: null,
    alerts: [],
    connected: false,
    error: null,
  })

  const connect = useCallback(() => {
    const eventSource = new EventSource("/api/ws")

    eventSource.onopen = () => {
      setData((prev) => ({ ...prev, connected: true, error: null }))
    }

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case "prices":
            setData((prev) => ({ ...prev, prices: message.data }))
            break
          case "health":
            setData((prev) => ({ ...prev, health: message.data }))
            break
          case "alerts":
            setData((prev) => ({ ...prev, alerts: message.data }))
            break
        }
      } catch (error) {
        console.error("[v0] SSE parse error:", error)
      }
    }

    eventSource.onerror = () => {
      setData((prev) => ({ ...prev, connected: false, error: "Connection lost" }))
      eventSource.close()

      // Reconnect after 5 seconds
      setTimeout(connect, 5000)
    }

    return eventSource
  }, [])

  useEffect(() => {
    const eventSource = connect()
    return () => eventSource.close()
  }, [connect])

  return data
}
