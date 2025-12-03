"use client"

import { type OracleStatus, type OracleHealth, PriceSource } from "@/lib/types/oracle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Activity, CheckCircle, AlertTriangle, XCircle, Zap, Database, Clock } from "lucide-react"

interface HealthStatusProps {
  status: OracleStatus
}

export function HealthStatus({ status }: HealthStatusProps) {
  const getStatusColor = (s: "healthy" | "degraded" | "offline") => {
    switch (s) {
      case "healthy":
        return "text-emerald-500"
      case "degraded":
        return "text-amber-500"
      case "offline":
        return "text-destructive"
    }
  }

  const getStatusIcon = (s: "healthy" | "degraded" | "offline") => {
    switch (s) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "offline":
        return <XCircle className="h-5 w-5 text-destructive" />
    }
  }

  const getOverallStatusBadge = () => {
    const colors: Record<string, string> = {
      operational: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      degraded: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      critical: "bg-destructive/20 text-destructive border-destructive/30",
    }
    return colors[status.overallStatus]
  }

  const getSourceIcon = (source: PriceSource) => {
    switch (source) {
      case PriceSource.Pyth:
        return "🔮"
      case PriceSource.Switchboard:
        return "⚡"
      case PriceSource.Internal:
        return "🏠"
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
          <Badge variant="outline" className={cn(getOverallStatusBadge())}>
            {status.overallStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-emerald-500">{status.uptime.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{status.totalSymbols}</div>
              <div className="text-xs text-muted-foreground">Symbols</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold">{status.activeFeeds}</div>
              <div className="text-xs text-muted-foreground">Active Feeds</div>
            </div>
          </div>

          {/* Oracle Sources */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Oracle Sources</h4>
            {status.sources.map((source) => (
              <SourceHealthRow key={source.source} health={source} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SourceHealthRow({ health }: { health: OracleHealth }) {
  const getLatencyColor = (latency: number) => {
    if (latency < 50) return "text-emerald-500"
    if (latency < 100) return "text-amber-500"
    return "text-destructive"
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 min-w-[120px]">
        {health.status === "healthy" ? (
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        ) : health.status === "degraded" ? (
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        <span className="font-medium">{health.source}</span>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-muted-foreground" />
          <span className={getLatencyColor(health.latency)}>{health.latency}ms</span>
        </div>
        <div className="flex items-center gap-1">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-emerald-500">{health.successRate.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">{Math.round((Date.now() - health.lastUpdate) / 1000)}s ago</span>
        </div>
      </div>
    </div>
  )
}
