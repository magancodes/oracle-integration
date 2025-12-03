"use client"

import { type SymbolPrice, PriceSource } from "@/lib/types/oracle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle } from "lucide-react"

interface PriceCardProps {
  price: SymbolPrice
  previousPrice?: number
  onClick?: () => void
}

export function PriceCard({ price, previousPrice, onClick }: PriceCardProps) {
  const priceChange = previousPrice ? ((price.price - previousPrice) / previousPrice) * 100 : 0
  const isPositive = priceChange >= 0

  const formatPrice = (value: number) => {
    if (value >= 1000) return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (value >= 1) return value.toFixed(4)
    return value.toFixed(6)
  }

  const getSourceBadge = (source: PriceSource) => {
    const colors: Record<PriceSource, string> = {
      [PriceSource.Pyth]: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      [PriceSource.Switchboard]: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      [PriceSource.Internal]: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    }
    return colors[source]
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:border-primary/50 bg-card/50 backdrop-blur-sm overflow-hidden",
        !price.isValid && "border-destructive/50",
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{price.symbol}</CardTitle>
          <div className="flex items-center gap-2">
            {price.isValid ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Main Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight">${formatPrice(price.price)}</span>
            <div
              className={cn(
                "flex items-center text-sm font-medium",
                isPositive ? "text-emerald-500" : "text-destructive",
              )}
            >
              {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              {Math.abs(priceChange).toFixed(3)}%
            </div>
          </div>

          {/* Confidence & Deviation */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Confidence: ±${formatPrice(price.confidence)}</span>
            <span>Deviation: {price.deviation.toFixed(2)} bps</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {price.sources.map((source, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className={cn("text-xs truncate max-w-full", getSourceBadge(source.source))}
              >
                <span className="truncate">
                  {source.source}: ${formatPrice(source.price)}
                </span>
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs gap-2">
            <span className="text-muted-foreground truncate">Updated: {formatTime(price.timestamp)}</span>
            <span
              className={cn(
                "font-medium shrink-0",
                price.staleness < 5 ? "text-emerald-500" : price.staleness < 15 ? "text-amber-500" : "text-destructive",
              )}
            >
              {price.staleness < 5 ? "Live" : price.staleness < 15 ? `${price.staleness.toFixed(0)}s` : "Stale"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
