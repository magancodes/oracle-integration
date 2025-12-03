"use client"

import type { DeviationAlert } from "@/lib/types/oracle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { AlertTriangle, Bell, CheckCircle, Clock, TrendingUp, TrendingDown } from "lucide-react"

interface AlertsPanelProps {
  alerts: DeviationAlert[]
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  const getSeverityBadge = (severity: "warning" | "critical") => {
    return severity === "critical"
      ? "bg-destructive/20 text-destructive border-destructive/30"
      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
  }

  const getPriceDirection = (alert: DeviationAlert) => {
    if (alert.sources.length >= 2) {
      const internalSource = alert.sources.find((s) => s.source === "Internal")
      const currentSources = alert.sources.filter((s) => s.source !== "Internal")
      if (internalSource && currentSources.length > 0) {
        const avgCurrent = currentSources.reduce((sum, s) => sum + s.price, 0) / currentSources.length
        return avgCurrent > internalSource.price ? "up" : "down"
      }
    }
    return null
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Deviation Alerts
          </CardTitle>
          {alerts.length > 0 && (
            <Badge variant="secondary" className="bg-destructive/20 text-destructive">
              {alerts.length} active
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time alerts triggered when price changes exceed 0.1% (10 bps) threshold
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const direction = getPriceDirection(alert)
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      alert.resolved
                        ? "bg-muted/30 border-border"
                        : alert.severity === "critical"
                          ? "bg-destructive/10 border-destructive/30"
                          : "bg-amber-500/10 border-amber-500/30",
                    )}
                  >
                    <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {alert.resolved ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle
                            className={cn(
                              "h-4 w-4",
                              alert.severity === "critical" ? "text-destructive" : "text-amber-500",
                            )}
                          />
                        )}
                        <span className="font-medium">{alert.symbol}</span>
                        <Badge variant="outline" className={getSeverityBadge(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        {direction && (
                          <Badge
                            variant="outline"
                            className={
                              direction === "up"
                                ? "text-emerald-500 border-emerald-500/30"
                                : "text-destructive border-destructive/30"
                            }
                          >
                            {direction === "up" ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {direction === "up" ? "Price Up" : "Price Down"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(alert.timestamp)}</span>
                        <span>{formatTime(alert.timestamp)}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-muted-foreground">Price Change: </span>
                      <span
                        className={cn(
                          "font-mono font-medium",
                          alert.deviation > 50 ? "text-destructive" : "text-amber-500",
                        )}
                      >
                        {(alert.deviation / 100).toFixed(3)}% ({alert.deviation.toFixed(2)} bps)
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {alert.sources.map((s, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "text-xs px-2 py-1 rounded border",
                            s.source === "Internal"
                              ? "bg-muted text-muted-foreground border-border"
                              : "bg-primary/10 text-primary border-primary/30",
                          )}
                        >
                          {s.source === "Internal" ? "Previous" : s.source}: $
                          {s.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-3 text-emerald-500/50" />
              <p className="font-medium">No deviation alerts</p>
              <p className="text-sm text-center max-w-xs mt-1">
                Alerts will appear here when price changes exceed the 0.1% threshold between updates
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
