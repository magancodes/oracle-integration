"use client"

import type { OracleStatus } from "@/lib/types/oracle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Clock, Server, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface HealthPanelProps {
  status: OracleStatus
}

export function HealthPanel({ status }: HealthPanelProps) {
  const getStatusColor = (s: "healthy" | "degraded" | "offline") => {
    switch (s) {
      case "healthy":
        return "text-green-500 bg-green-500/10 border-green-500/30"
      case "degraded":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
      case "offline":
        return "text-red-500 bg-red-500/10 border-red-500/30"
    }
  }

  const getOverallStatusIcon = () => {
    switch (status.overallStatus) {
      case "operational":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
    }
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Oracle Health Monitor
          </span>
          <Badge
            className={cn(
              "capitalize",
              status.overallStatus === "operational"
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : status.overallStatus === "degraded"
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30",
            )}
          >
            {getOverallStatusIcon()}
            <span className="ml-1">{status.overallStatus}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              System Uptime
            </div>
            <div className="text-2xl font-bold text-green-500">{status.uptime.toFixed(1)}%</div>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/50 p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Server className="h-4 w-4" />
              Active Feeds
            </div>
            <div className="text-2xl font-bold">
              {status.activeFeeds}/{status.totalSymbols}
            </div>
          </div>
        </div>

        {/* Source Health */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Oracle Sources</h4>
          {status.sources.map((source) => (
            <div key={source.source} className={cn("rounded-lg border p-3", getStatusColor(source.status))}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{source.source}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {source.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  {source.latency}ms
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Success Rate</span>
                  <span className="font-mono">{source.successRate.toFixed(1)}%</span>
                </div>
                <Progress value={source.successRate} className="h-1.5" />
              </div>
              {source.errorCount > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs">
                  <AlertTriangle className="h-3 w-3" />
                  {source.errorCount} errors in last hour
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span>Last updated</span>
          <span className="font-mono">{new Date(status.lastUpdate).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
