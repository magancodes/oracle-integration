"use client"

import type { OracleConfig } from "@/lib/types/oracle"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Settings, ExternalLink } from "lucide-react"

interface OracleConfigTableProps {
  configs: OracleConfig[]
}

export function OracleConfigTable({ configs }: OracleConfigTableProps) {
  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Oracle Configurations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Pyth Feed</TableHead>
                <TableHead>Switchboard</TableHead>
                <TableHead className="text-right">Max Staleness</TableHead>
                <TableHead className="text-right">Max Confidence</TableHead>
                <TableHead className="text-right">Max Deviation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.symbol}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{config.symbol}</Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://pyth.network/price-feeds/${config.pythFeed}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {truncateAddress(config.pythFeed)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell>
                    <a
                      href={`https://switchboard.xyz/explorer/${config.switchboardAggregator}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {truncateAddress(config.switchboardAggregator)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-mono">{config.maxStaleness}s</TableCell>
                  <TableCell className="text-right font-mono">{config.maxConfidence} bps</TableCell>
                  <TableCell className="text-right font-mono">{config.maxDeviation} bps</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
