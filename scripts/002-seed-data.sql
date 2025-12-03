-- Seed Oracle Configurations

INSERT INTO oracle_configs (symbol, pyth_feed, switchboard_aggregator, max_staleness, max_confidence, max_deviation)
VALUES 
    ('BTC/USD', 'GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU', '8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ec', 30, 100, 100),
    ('ETH/USD', 'JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB', 'HNStfhaLnqwF2ZtJUizaA9uHDAVB976r2AgTUx9LrdEo', 30, 100, 100),
    ('SOL/USD', 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG', 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR', 30, 100, 100),
    ('AVAX/USD', 'Ax9ujW5B9oqcv59N8m6f1BpTBq2rGeGaBcpKjC5UYsXU', 'Bq8XJRc6YDmKB4eFLFGVnBUxJZQTbWVszpF2Qx3rQvTt', 30, 100, 100),
    ('LINK/USD', 'ALdkqQDMfHNg77oCNskfX751kHzfWAqYBaH8ZGqTsLhE', 'CjFcXe4Akbjz7dQ8tPLZwmWMqLfWoAFf42t1B2ZnwkZG', 30, 100, 100)
ON CONFLICT (symbol) DO UPDATE SET
    pyth_feed = EXCLUDED.pyth_feed,
    switchboard_aggregator = EXCLUDED.switchboard_aggregator,
    updated_at = NOW();

-- Seed initial health metrics
INSERT INTO oracle_health_metrics (source, status, latency_ms, success_rate, error_count)
VALUES 
    ('Pyth', 'healthy', 45, 99.95, 0),
    ('Switchboard', 'healthy', 78, 99.87, 0),
    ('Internal', 'healthy', 5, 100.00, 0);
