// WebSocket-like endpoint for real-time price updates
// Note: This is a Server-Sent Events (SSE) implementation since Next.js doesn't support WebSockets directly

import { getOracleManager } from "@/lib/services/oracle-manager"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const encoder = new TextEncoder()
  const oracleManager = getOracleManager()

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial prices
      try {
        const prices = await oracleManager.getAllPrices()
        const health = oracleManager.getOracleStatus()

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "prices", data: prices })}\n\n`))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "health", data: health })}\n\n`))
      } catch (error) {
        console.error("[v0] SSE initial data error:", error)
      }

      // Set up interval for updates
      const interval = setInterval(async () => {
        try {
          const prices = await oracleManager.getAllPrices()
          const health = oracleManager.getOracleStatus()
          const alerts = oracleManager.getAlerts(10)

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "prices", data: prices })}\n\n`))
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "health", data: health })}\n\n`))

          if (alerts.length > 0) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "alerts", data: alerts })}\n\n`))
          }
        } catch (error) {
          console.error("[v0] SSE update error:", error)
        }
      }, 2000) // Update every 2 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
