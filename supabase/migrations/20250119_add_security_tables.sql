-- Security and Monitoring Tables
-- Migration: 20250119_add_security_tables.sql
-- Purpose: Add tables for error logging, rate limiting, and security events

-- Error logging table
CREATE TABLE IF NOT EXISTS error_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  url TEXT,
  user_agent TEXT,
  ip_address INET,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for efficient time-based queries
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);

-- Create index on user_id for user-specific error queries
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);

-- Create index on ip_address for IP-based queries
CREATE INDEX IF NOT EXISTS idx_error_logs_ip_address ON error_logs(ip_address);

-- Add comment
COMMENT ON TABLE error_logs IS 'Logs client-side and server-side errors for monitoring and debugging';

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  ip_address INET NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  last_request_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip_address, endpoint)
);

-- Create index on window_start for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Create index on ip_address for rate limit checks
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_address ON rate_limits(ip_address);

-- Add comment
COMMENT ON TABLE rate_limits IS 'Tracks request counts per IP address and endpoint for rate limiting';

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  ip_address INET,
  user_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- Create index on severity for filtering critical events
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);

-- Create index on event_type for filtering by event type
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);

-- Create index on ip_address for IP-based queries
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON security_events(ip_address);

-- Create index on user_id for user-specific events
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);

-- Add comment
COMMENT ON TABLE security_events IS 'Logs security-related events like failed auth attempts, rate limit violations, etc.';

-- Data retention: Automatically delete old logs (optional, can be enabled later)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('cleanup-old-error-logs', '0 2 * * *', 'DELETE FROM error_logs WHERE created_at < NOW() - INTERVAL ''90 days''');
-- SELECT cron.schedule('cleanup-old-security-events', '0 2 * * *', 'DELETE FROM security_events WHERE created_at < NOW() - INTERVAL ''90 days'' AND severity IN (''low'', ''medium'')');

-- User data privacy table (for GDPR compliance)
CREATE TABLE IF NOT EXISTS user_privacy_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  request_type TEXT CHECK (request_type IN ('export', 'delete', 'anonymize')),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by INTEGER,
  notes TEXT,
  metadata JSONB
);

-- Create index on user_id for user-specific requests
CREATE INDEX IF NOT EXISTS idx_privacy_requests_user_id ON user_privacy_requests(user_id);

-- Create index on status for filtering pending requests
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON user_privacy_requests(status);

-- Create index on requested_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_privacy_requests_requested_at ON user_privacy_requests(requested_at DESC);

-- Add comment
COMMENT ON TABLE user_privacy_requests IS 'Tracks GDPR data export/deletion requests from users';

-- Audit log table (for tracking sensitive operations)
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id INTEGER,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create index on user_id for user-specific audits
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Create index on action for filtering by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Create index on resource for resource-specific audits
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Add comment
COMMENT ON TABLE audit_logs IS 'Tracks all sensitive operations for security auditing and compliance';

-- Session tracking for enhanced security
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create index on session_token for quick lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Create index on user_id for user-specific sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Create index on is_active for filtering active sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);

-- Add comment
COMMENT ON TABLE user_sessions IS 'Tracks active user sessions for security monitoring and management';

-- Grant permissions (adjust based on your RLS policies)
-- GRANT SELECT, INSERT ON error_logs TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON rate_limits TO authenticated;
-- GRANT SELECT, INSERT ON security_events TO authenticated;
-- GRANT SELECT, INSERT ON user_privacy_requests TO authenticated;
-- GRANT SELECT ON audit_logs TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON user_sessions TO authenticated;
