-- Oracle System PostgreSQL Functions and Procedures
-- For price validation, aggregation, and health monitoring

-- Function to insert price with validation
CREATE OR REPLACE FUNCTION insert_validated_price(
    p_symbol VARCHAR(20),
    p_price DECIMAL(30, 10),
    p_confidence DECIMAL(30, 10),
    p_source VARCHAR(20),
    p_expo INTEGER DEFAULT -8
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_last_price DECIMAL(30, 10);
    v_max_deviation DECIMAL(5, 2) := 5.0; -- 5% max deviation
BEGIN
    -- Get last price for this symbol
    SELECT price INTO v_last_price
    FROM price_history
    WHERE symbol = p_symbol
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- Validate price deviation if we have history
    IF v_last_price IS NOT NULL THEN
        IF ABS((p_price - v_last_price) / v_last_price * 100) > v_max_deviation THEN
            -- Insert alert for large deviation
            INSERT INTO deviation_alerts (symbol, deviation, severity, source_prices, timestamp)
            VALUES (
                p_symbol,
                ABS((p_price - v_last_price) / v_last_price * 10000),
                CASE WHEN ABS((p_price - v_last_price) / v_last_price * 100) > 10 THEN 'critical' ELSE 'warning' END,
                jsonb_build_array(jsonb_build_object('source', p_source, 'price', p_price)),
                NOW()
            );
        END IF;
    END IF;
    
    -- Insert the price
    INSERT INTO price_history (symbol, price, confidence, source, expo, timestamp)
    VALUES (p_symbol, p_price, p_confidence, p_source, p_expo, NOW())
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get aggregated price from multiple sources
CREATE OR REPLACE FUNCTION get_consensus_price(p_symbol VARCHAR(20))
RETURNS TABLE (
    consensus_price DECIMAL(30, 10),
    source_count INTEGER,
    max_deviation DECIMAL(10, 4),
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH recent_prices AS (
        SELECT price, source
        FROM price_history
        WHERE symbol = p_symbol
        AND timestamp > NOW() - INTERVAL '30 seconds'
        ORDER BY timestamp DESC
    ),
    price_stats AS (
        SELECT 
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price,
            COUNT(DISTINCT source) as src_count
        FROM recent_prices
    )
    SELECT 
        ps.median_price::DECIMAL(30, 10),
        ps.src_count::INTEGER,
        COALESCE(
            (SELECT MAX(ABS(rp.price - ps.median_price) / ps.median_price * 10000)
             FROM recent_prices rp),
            0
        )::DECIMAL(10, 4),
        (ps.src_count >= 1 AND ps.median_price IS NOT NULL)::BOOLEAN
    FROM price_stats ps;
END;
$$ LANGUAGE plpgsql;

-- Function to update oracle health metrics
CREATE OR REPLACE FUNCTION update_oracle_health(
    p_source VARCHAR(20),
    p_status VARCHAR(20),
    p_latency_ms INTEGER,
    p_success BOOLEAN
) RETURNS VOID AS $$
DECLARE
    v_recent_success DECIMAL(5, 2);
    v_recent_total INTEGER;
    v_recent_success_count INTEGER;
BEGIN
    -- Calculate success rate from last 100 requests
    SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'healthy')
    INTO v_recent_total, v_recent_success_count
    FROM oracle_health_metrics
    WHERE source = p_source
    AND timestamp > NOW() - INTERVAL '1 hour'
    ORDER BY timestamp DESC
    LIMIT 100;
    
    v_recent_success := CASE 
        WHEN v_recent_total > 0 THEN (v_recent_success_count::DECIMAL / v_recent_total * 100)
        ELSE 100.0
    END;
    
    -- Insert new health metric
    INSERT INTO oracle_health_metrics (source, status, latency_ms, success_rate, error_count, timestamp)
    VALUES (
        p_source,
        p_status,
        p_latency_ms,
        v_recent_success,
        CASE WHEN p_success THEN 0 ELSE 1 END,
        NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Function to calculate source reliability over a period
CREATE OR REPLACE FUNCTION calculate_source_reliability(
    p_source VARCHAR(20),
    p_hours INTEGER DEFAULT 24
) RETURNS TABLE (
    total_requests INTEGER,
    successful_requests INTEGER,
    failed_requests INTEGER,
    avg_latency_ms DECIMAL(10, 2),
    min_latency_ms INTEGER,
    max_latency_ms INTEGER,
    uptime_percentage DECIMAL(5, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER,
        COUNT(*) FILTER (WHERE status = 'healthy')::INTEGER,
        COUNT(*) FILTER (WHERE status != 'healthy')::INTEGER,
        AVG(latency_ms)::DECIMAL(10, 2),
        MIN(latency_ms)::INTEGER,
        MAX(latency_ms)::INTEGER,
        (COUNT(*) FILTER (WHERE status = 'healthy')::DECIMAL / NULLIF(COUNT(*), 0) * 100)::DECIMAL(5, 2)
    FROM oracle_health_metrics
    WHERE source = p_source
    AND timestamp > NOW() - (p_hours || ' hours')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-resolve old alerts
CREATE OR REPLACE FUNCTION auto_resolve_alerts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deviation_alerts
    SET resolved = TRUE, resolved_at = NOW()
    WHERE resolved = FALSE
    AND timestamp < NOW() - INTERVAL '5 minutes';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_resolve_alerts ON deviation_alerts;
CREATE TRIGGER trigger_auto_resolve_alerts
AFTER INSERT ON deviation_alerts
FOR EACH STATEMENT
EXECUTE FUNCTION auto_resolve_alerts();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_price_history_recent 
ON price_history (symbol, timestamp DESC) 
WHERE timestamp > NOW() - INTERVAL '1 hour';
