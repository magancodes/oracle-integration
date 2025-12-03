"use client"

import type { OracleStatus } from "@/lib/types/oracle"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Activity, Zap, Database, Clock, Circle } from "lucide-react"

interface HeaderProps {
  status?: OracleStatus
}

export function Header({ status }: HeaderProps) {
  const getStatusColor = () => {
    if (!status) return "bg-muted"
    switch (status.overallStatus) {
      case "operational":
        return "bg-emerald-500"
      case "degraded":
        return "bg-amber-500"
      case "critical":
        return "bg-destructive"
    }
  }

  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Zap className="h-8 w-8 text-primary" />
                <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Oracle System</h1>
                <p className="text-xs text-muted-foreground">Price Feed Integration</p>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-6">
            {status && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Circle className={cn("h-2 w-2 fill-current", getStatusColor())} />
                  <span className="text-muted-foreground">System:</span>
                  <span className="font-medium capitalize">{status.overallStatus}</span>
                </div>

                <div className="h-4 w-px bg-border" />

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Database className="h-4 w-4" />
                    <span>{status.totalSymbols} symbols</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4" />
                    <span>{status.activeFeeds} feeds</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{status.uptime.toFixed(1)}% uptime</span>
                  </div>
                </div>
              </>
            )}

            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
              Live
            </Badge>
          </div>
        </div>
      </div>
    </header>
  )
}
