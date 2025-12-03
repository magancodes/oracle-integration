-- Oracle Integration Database Schema
-- PostgreSQL schema for price history, oracle health, and alerts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb" CASCADE;

-- Price History Table (main time-series data)
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(30, 10) NOT NULL,
    confidence DECIMAL(30, 10) NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('Pyth', 'Switchboard', 'Internal')),
    expo INTEGER NOT NULL DEFAULT -8,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create hypertable for efficient time-series storage (if TimescaleDB is available)
-- SELECT create_hypertable('price_history', 'timestamp', if_not_exists => TRUE);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(symbol);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_timestamp ON price_history(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_source ON price_history(source);

-- Oracle Configurations Table
CREATE TABLE IF NOT EXISTS oracle_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL,
    pyth_feed VARCHAR(64) NOT NULL,
    switchboard_aggregator VARCHAR(64) NOT NULL,
    max_staleness INTEGER NOT NULL DEFAULT 30,
    max_confidence INTEGER NOT NULL DEFAULT 100,
    max_deviation INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Oracle Health Metrics Table
CREATE TABLE IF NOT EXISTS oracle_health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(20) NOT NULL CHECK (source IN ('Pyth', 'Switchboard', 'Internal')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'offline')),
    latency_ms INTEGER NOT NULL,
    success_rate DECIMAL(5, 2) NOT NULL,
    error_count INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_source ON oracle_health_metrics(source);
CREATE INDEX IF NOT EXISTS idx_health_metrics_timestamp ON oracle_health_metrics(timestamp DESC);

-- Deviation Alerts Table
CREATE TABLE IF NOT EXISTS deviation_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    deviation DECIMAL(10, 4) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('warning', 'critical')),
    source_prices JSONB NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON deviation_alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON deviation_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON deviation_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON deviation_alerts(timestamp DESC);

-- Source Reliability Statistics Table
CREATE TABLE IF NOT EXISTS source_reliability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(20) NOT NULL CHECK (source IN ('Pyth', 'Switchboard', 'Internal')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_requests INTEGER NOT NULL DEFAULT 0,
    successful_requests INTEGER NOT NULL DEFAULT 0,
    failed_requests INTEGER NOT NULL DEFAULT 0,
    avg_latency_ms DECIMAL(10, 2),
    min_latency_ms INTEGER,
    max_latency_ms INTEGER,
    uptime_percentage DECIMAL(5, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reliability_source ON source_reliability(source);
CREATE INDEX IF NOT EXISTS idx_reliability_period ON source_reliability(period_start, period_end);

-- Consensus Price Table (validated prices)
CREATE TABLE IF NOT EXISTS consensus_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) NOT NULL,
    consensus_price DECIMAL(30, 10) NOT NULL,
    source_count INTEGER NOT NULL,
    deviation DECIMAL(10, 4) NOT NULL,
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consensus_symbol ON consensus_prices(symbol);
CREATE INDEX IF NOT EXISTS idx_consensus_timestamp ON consensus_prices(timestamp DESC);

-- Price Aggregation View
CREATE OR REPLACE VIEW v_latest_prices AS
SELECT DISTINCT ON (symbol)
    symbol,
    consensus_price as price,
    deviation,
    is_valid,
    timestamp
FROM consensus_prices
ORDER BY symbol, timestamp DESC;

-- Oracle Health Summary View
CREATE OR REPLACE VIEW v_oracle_health_summary AS
SELECT 
    source,
    status,
    latency_ms,
    success_rate,
    error_count,
    timestamp as last_update
FROM oracle_health_metrics
WHERE timestamp > NOW() - INTERVAL '5 minutes'
ORDER BY timestamp DESC;
