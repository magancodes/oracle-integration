"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Loader2, Wifi, WifiOff, Clock, Activity, TrendingUp } from "lucide-react"

interface ConnectionInfo {
  name: string
  url: string
  status: "connected" | "disconnected" | "connecting"
  latency?: number
  lastCheck: number
  requestCount: number
  successCount: number
}

export function ConnectionStatus() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([
    {
      name: "Pyth Network (Hermes)",
      url: "https://hermes.pyth.network",
      status: "connecting",
      lastCheck: Date.now(),
      requestCount: 0,
      successCount: 0,
    },
    {
      name: "Switchboard (On-Demand)",
      url: "https://ondemand.switchboard.xyz",
      status: "connecting",
      lastCheck: Date.now(),
      requestCount: 0,
      successCount: 0,
    },
  ])

  useEffect(() => {
    const checkConnections = async () => {
      const updatedConnections = await Promise.all(
        connections.map(async (conn) => {
          const startTime = Date.now()
          const newRequestCount = conn.requestCount + 1
          try {
            if (conn.name.includes("Pyth")) {
              const response = await fetch(
                `${conn.url}/api/latest_price_feeds?ids[]=0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43`,
                {
                  cache: "no-store",
                  signal: AbortSignal.timeout(10000),
                },
              )
              const latency = Date.now() - startTime
              const isOk = response.ok
              return {
                ...conn,
                status: isOk ? "connected" : "disconnected",
                latency,
                lastCheck: Date.now(),
                requestCount: newRequestCount,
                successCount: isOk ? conn.successCount + 1 : conn.successCount,
              } as ConnectionInfo
            } else {
              const response = await fetch(
                `${conn.url}/solana/mainnet/feed/GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR`,
                {
                  cache: "no-store",
                  signal: AbortSignal.timeout(10000),
                },
              ).catch(() => null)
              const latency = Date.now() - startTime
              const isOk = response?.ok ?? false
              return {
                ...conn,
                status: isOk ? "connected" : "disconnected",
                latency,
                lastCheck: Date.now(),
                requestCount: newRequestCount,
                successCount: isOk ? conn.successCount + 1 : conn.successCount,
              } as ConnectionInfo
            }
          } catch {
            return {
              ...conn,
              status: "disconnected",
              lastCheck: Date.now(),
              requestCount: newRequestCount,
            } as ConnectionInfo
          }
        }),
      )
      setConnections(updatedConnections)
    }

    checkConnections()
    const interval = setInterval(checkConnections, 30000)
    return () => clearInterval(interval)
  }, [])

  const allConnected = connections.every((c) => c.status === "connected")
  const anyConnecting = connections.some((c) => c.status === "connecting")
  const pythConnected = connections.find((c) => c.name.includes("Pyth"))?.status === "connected"

  const calculateUptime = (conn: ConnectionInfo) => {
    if (conn.requestCount === 0) return "0.0"
    return ((conn.successCount / conn.requestCount) * 100).toFixed(1)
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {anyConnecting ? (
            <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
          ) : allConnected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : pythConnected ? (
            <Wifi className="h-5 w-5 text-yellow-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          Real-time Oracle Connections
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {connections.map((conn) => (
          <div key={conn.name} className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/50 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {conn.status === "connected" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                ) : conn.status === "connecting" ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-yellow-500" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                )}
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{conn.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{conn.url}</p>
                </div>
              </div>
              <Badge
                variant={
                  conn.status === "connected" ? "default" : conn.status === "connecting" ? "secondary" : "destructive"
                }
                className={`shrink-0 ${
                  conn.status === "connected"
                    ? "bg-green-500/20 text-green-400 border-green-500/30"
                    : conn.status === "connecting"
                      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      : ""
                }`}
              >
                {conn.status === "connected" ? "Live" : conn.status === "connecting" ? "Connecting..." : "Offline"}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pl-8">
              {conn.latency !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{conn.latency}ms</span>
                </div>
              )}
              {conn.requestCount > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Uptime: {calculateUptime(conn)}%</span>
                </div>
              )}
              {conn.requestCount > 0 && (
                <div className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  <span>
                    {conn.successCount}/{conn.requestCount} requests
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="mt-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
          <p className="text-sm text-green-400">
            <strong>Connected to Mainnet Oracles:</strong> This system fetches live prices from Pyth Network's Hermes
            API (mainnet). All price data is real and updated in real-time.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
