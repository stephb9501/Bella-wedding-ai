-- =====================================================
-- EMAIL PREFERENCES AND LOGGING SYSTEM
-- =====================================================
-- This migration creates tables for managing user email
-- notification preferences and logging sent emails
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: email_preferences
-- Stores user preferences for email notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Email notification types (true = enabled, false = disabled)
  welcome BOOLEAN DEFAULT true,
  booking_confirmed BOOLEAN DEFAULT true,
  booking_reminder BOOLEAN DEFAULT true,
  message_notification BOOLEAN DEFAULT true,
  review_request BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT true,
  vendor_lead BOOLEAN DEFAULT true,

  -- Marketing and promotional emails
  marketing_emails BOOLEAN DEFAULT true,
  product_updates BOOLEAN DEFAULT true,

  -- Unsubscribe functionality
  unsubscribe_token UUID DEFAULT gen_random_uuid() UNIQUE,
  unsubscribed_all BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one preference record per user
  UNIQUE(user_id)
);

-- =====================================================
-- TABLE 2: email_logs
-- Logs all email send attempts for debugging and analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Email details
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,

  -- Status tracking
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message TEXT,

  -- Additional data
  metadata JSONB,

  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Index for performance
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for performance
-- =====================================================

-- Email preferences indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id
  ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribe_token
  ON email_preferences(unsubscribe_token);

-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id
  ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type
  ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status
  ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at
  ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email
  ON email_logs(recipient_email);

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_email_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_preferences_updated_at
  BEFORE UPDATE ON email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_preferences_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Email preferences policies
-- Users can view their own preferences
CREATE POLICY email_preferences_select_own
  ON email_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY email_preferences_update_own
  ON email_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY email_preferences_insert_own
  ON email_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Email logs policies
-- Users can view their own email logs
CREATE POLICY email_logs_select_own
  ON email_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert email logs (for the email service)
CREATE POLICY email_logs_insert_service
  ON email_logs
  FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- HELPER FUNCTION: Create default preferences for new users
-- =====================================================

CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create preferences for new users
CREATE TRIGGER trigger_create_default_email_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- =====================================================
-- HELPER FUNCTION: Unsubscribe via token
-- =====================================================

CREATE OR REPLACE FUNCTION unsubscribe_by_token(token UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE email_preferences
  SET
    unsubscribed_all = true,
    welcome = false,
    booking_confirmed = false,
    booking_reminder = false,
    message_notification = false,
    review_request = false,
    weekly_digest = false,
    vendor_lead = false,
    marketing_emails = false,
    product_updates = false,
    updated_at = NOW()
  WHERE unsubscribe_token = token;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- HELPER FUNCTION: Get email statistics
-- =====================================================

CREATE OR REPLACE FUNCTION get_email_stats(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  email_type VARCHAR(50),
  total_sent BIGINT,
  total_failed BIGINT,
  total_skipped BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    el.email_type,
    COUNT(*) FILTER (WHERE el.status = 'sent') AS total_sent,
    COUNT(*) FILTER (WHERE el.status = 'failed') AS total_failed,
    COUNT(*) FILTER (WHERE el.status = 'skipped') AS total_skipped,
    ROUND(
      (COUNT(*) FILTER (WHERE el.status = 'sent')::NUMERIC /
       NULLIF(COUNT(*), 0) * 100), 2
    ) AS success_rate
  FROM email_logs el
  WHERE el.sent_at BETWEEN start_date AND end_date
  GROUP BY el.email_type
  ORDER BY total_sent DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS for documentation
-- =====================================================

COMMENT ON TABLE email_preferences IS 'User preferences for email notifications';
COMMENT ON TABLE email_logs IS 'Audit log of all email send attempts';
COMMENT ON COLUMN email_preferences.unsubscribe_token IS 'Unique token for one-click unsubscribe links';
COMMENT ON COLUMN email_preferences.unsubscribed_all IS 'Master unsubscribe flag - disables all emails';
COMMENT ON FUNCTION unsubscribe_by_token IS 'Unsubscribe user from all emails using their unique token';
COMMENT ON FUNCTION get_email_stats IS 'Get email sending statistics for a date range';

-- =====================================================
-- SEED DATA: Create preferences for existing users
-- =====================================================

-- Create default preferences for all existing users who don't have them
INSERT INTO email_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
