"use client"

import type { PriceHistory } from "@/lib/types/oracle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from "recharts"
import { TrendingUp } from "lucide-react"

interface PriceChartProps {
  symbol: string
  history: PriceHistory[]
  currentPrice?: number
}

const CHART_GREEN = "#4ade80" // Light green (Tailwind green-400)
const CHART_TEXT_WHITE = "#ffffff"

export function PriceChart({ symbol, history, currentPrice }: PriceChartProps) {
  // Transform and sort data for chart
  const chartData = [...history]
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((h) => ({
      time: new Date(h.timestamp).toLocaleTimeString(),
      price: h.price,
      confidence: h.confidence,
      timestamp: h.timestamp,
    }))

  const minPrice = Math.min(...chartData.map((d) => d.price)) * 0.9995
  const maxPrice = Math.max(...chartData.map((d) => d.price)) * 1.0005

  const formatPrice = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toFixed(2)}`
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            {symbol} Price History
          </CardTitle>
          {currentPrice && (
            <span className="text-sm font-mono text-muted-foreground">
              Current: ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_GREEN} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CHART_GREEN} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke={CHART_TEXT_WHITE}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: CHART_TEXT_WHITE }}
                />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  stroke={CHART_TEXT_WHITE}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatPrice}
                  width={60}
                  tick={{ fill: CHART_TEXT_WHITE }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    border: `1px solid ${CHART_GREEN}`,
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: CHART_TEXT_WHITE,
                  }}
                  itemStyle={{ color: CHART_TEXT_WHITE }}
                  labelStyle={{ color: CHART_TEXT_WHITE }}
                  formatter={(value: number) => [
                    `$${value.toLocaleString(undefined, { minimumFractionDigits: 4 })}`,
                    "Price",
                  ]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                {currentPrice && (
                  <ReferenceLine y={currentPrice} stroke={CHART_GREEN} strokeDasharray="3 3" strokeOpacity={0.7} />
                )}
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={CHART_GREEN}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: CHART_GREEN, stroke: CHART_TEXT_WHITE, strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading price history...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
