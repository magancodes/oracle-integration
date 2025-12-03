"use client"

import { useState, useMemo } from "react"
import { useAllPrices, useOracleHealth, usePriceHistory, useAlerts, useOracleConfigs } from "@/hooks/use-oracle-data"
import { Header } from "./header"
import { PriceCard } from "./price-card"
import { HealthStatus } from "./health-status"
import { PriceChart } from "./price-chart"
import { AlertsPanel } from "./alerts-panel"
import { OracleConfigTable } from "./oracle-config-table"
import { DataStoragePanel } from "./data-storage-panel"
import { ConnectionStatus } from "./connection-status"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, LineChart, Settings, Bell, Loader2, Database, Wifi } from "lucide-react"

export function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USD")

  const { data: prices, isLoading: pricesLoading } = useAllPrices(1000)
  const { data: health, isLoading: healthLoading } = useOracleHealth(2000)
  const { data: history, isLoading: historyLoading } = usePriceHistory(selectedSymbol, 100)
  const { data: alerts } = useAlerts(50)
  const { data: configs } = useOracleConfigs()

  // Track previous prices for change calculation
  const previousPrices = useMemo(() => {
    if (!prices) return {}
    return prices.reduce(
      (acc, p) => {
        acc[p.symbol] = p.price
        return acc
      },
      {} as Record<string, number>,
    )
  }, [prices])

  const selectedPrice = prices?.find((p) => p.symbol === selectedSymbol)

  if (pricesLoading || healthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting to oracle feeds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header status={health} />

      <main className="container mx-auto px-6 py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="charts" className="gap-2">
              <LineChart className="h-4 w-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts
              {alerts && alerts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-destructive/20 text-destructive rounded-full">
                  {alerts.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections" className="gap-2">
              <Wifi className="h-4 w-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2">
              <Database className="h-4 w-4" />
              Storage
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <ConnectionStatus />

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Price Cards */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold">Live Price Feeds</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {prices?.map((price) => (
                    <PriceCard
                      key={price.symbol}
                      price={price}
                      previousPrice={previousPrices[price.symbol]}
                      onClick={() => setSelectedSymbol(price.symbol)}
                    />
                  ))}
                </div>
              </div>

              {/* Health Status */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">System Health</h2>
                {health && <HealthStatus status={health} />}
              </div>
            </div>

            {/* Quick Chart View */}
            {history && <PriceChart symbol={selectedSymbol} history={history} currentPrice={selectedPrice?.price} />}
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            {/* Symbol Selector */}
            <div className="flex gap-2 flex-wrap">
              {prices?.map((p) => (
                <button
                  key={p.symbol}
                  onClick={() => setSelectedSymbol(p.symbol)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSymbol === p.symbol ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {p.symbol}
                </button>
              ))}
            </div>

            {history && <PriceChart symbol={selectedSymbol} history={history} currentPrice={selectedPrice?.price} />}

            {/* Source Comparison */}
            {selectedPrice && (
              <div className="grid gap-4 md:grid-cols-2">
                {selectedPrice.sources.map((source, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{source.source}</span>
                      <span className={`text-sm ${source.source === "Pyth" ? "text-emerald-500" : "text-blue-500"}`}>
                        Active
                      </span>
                    </div>
                    <div className="text-2xl font-bold font-mono">
                      ${source.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Confidence: ±${source.confidence.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <AlertsPanel alerts={alerts || []} />
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            <ConnectionStatus />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border bg-card/50 p-4">
                <h3 className="font-semibold mb-2">Pyth Network</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Pyth Network delivers real-time market data from first-party sources like exchanges, market makers,
                  and financial services providers.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Endpoint:</span>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">hermes.pyth.network</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Feed Type:</span>
                    <span>Price Feed v2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Update Frequency:</span>
                    <span>~400ms</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border bg-card/50 p-4">
                <h3 className="font-semibold mb-2">Switchboard</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Switchboard is a permissionless oracle protocol providing general-purpose data feeds for smart
                  contracts on Solana and other chains.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">API Endpoint:</span>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">ondemand.switchboard.xyz</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Feed Type:</span>
                    <span>On-Demand Aggregator</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Update Frequency:</span>
                    <span>~1s</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage">
            <DataStoragePanel />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config">{configs && <OracleConfigTable configs={configs} />}</TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
