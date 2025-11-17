-- Create consent_logs table for GDPR/CCPA compliance
-- This table tracks user consent to various policies and terms

CREATE TABLE IF NOT EXISTS consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_type TEXT NOT NULL CHECK (policy_type IN (
        'terms_of_service',
        'privacy_policy',
        'acceptable_use',
        'ai_disclaimer',
        'vendor_disclaimer',
        'ip_agreement',
        'beta_agreement',
        'cookie_policy',
        'arbitration',
        'data_retention',
        'dmca_policy',
        'refund_policy'
    )),
    policy_version TEXT NOT NULL, -- e.g., "1.0", "1.1", "2.0"
    accepted BOOLEAN NOT NULL DEFAULT true,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET, -- IP address at time of consent
    user_agent TEXT, -- Browser/device info
    consent_method TEXT CHECK (consent_method IN (
        'signup_checkbox',
        'updated_terms_popup',
        'settings_page',
        'email_confirmation',
        'api_acceptance'
    )),
    parent_consent_id UUID REFERENCES consent_logs(id), -- Links to previous consent for tracking updates
    is_current BOOLEAN NOT NULL DEFAULT true, -- Marks the latest consent for this policy type
    withdrawn_at TIMESTAMPTZ, -- GDPR right to withdraw consent
    notes TEXT -- Optional notes about the consent (e.g., "Accepted during onboarding")
);

-- Indexes for performance
CREATE INDEX idx_consent_logs_user_id ON consent_logs(user_id);
CREATE INDEX idx_consent_logs_policy_type ON consent_logs(policy_type);
CREATE INDEX idx_consent_logs_timestamp ON consent_logs(timestamp DESC);
CREATE INDEX idx_consent_logs_is_current ON consent_logs(is_current) WHERE is_current = true;
CREATE INDEX idx_consent_logs_user_policy ON consent_logs(user_id, policy_type);

-- Composite index for finding current consent
CREATE UNIQUE INDEX idx_consent_logs_current_unique
ON consent_logs(user_id, policy_type)
WHERE is_current = true AND withdrawn_at IS NULL;

-- Enable Row Level Security
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own consent logs
CREATE POLICY "Users can view own consent logs"
    ON consent_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own consent logs (system typically does this)
CREATE POLICY "Users can insert own consent logs"
    ON consent_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own consent logs (e.g., withdrawing consent)
CREATE POLICY "Users can update own consent logs"
    ON consent_logs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all consent logs (for compliance audits)
-- Note: Replace with actual admin role check if you have one
CREATE POLICY "Admins can view all consent logs"
    ON consent_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to mark old consents as not current when new consent is added
CREATE OR REPLACE FUNCTION update_consent_current_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark all previous consents for this user/policy as not current
    UPDATE consent_logs
    SET is_current = false
    WHERE user_id = NEW.user_id
      AND policy_type = NEW.policy_type
      AND id != NEW.id
      AND is_current = true;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update is_current
CREATE TRIGGER trigger_update_consent_current
    AFTER INSERT ON consent_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_consent_current_status();

-- Function to withdraw consent (GDPR right to withdraw)
CREATE OR REPLACE FUNCTION withdraw_consent(
    p_user_id UUID,
    p_policy_type TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE consent_logs
    SET withdrawn_at = NOW(),
        is_current = false
    WHERE user_id = p_user_id
      AND policy_type = p_policy_type
      AND is_current = true
      AND withdrawn_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has current consent for a policy
CREATE OR REPLACE FUNCTION has_current_consent(
    p_user_id UUID,
    p_policy_type TEXT,
    p_min_version TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_has_consent BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM consent_logs
        WHERE user_id = p_user_id
          AND policy_type = p_policy_type
          AND is_current = true
          AND withdrawn_at IS NULL
          AND accepted = true
          AND (p_min_version IS NULL OR policy_version >= p_min_version)
    ) INTO v_has_consent;

    RETURN v_has_consent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for current consents (easier querying)
CREATE OR REPLACE VIEW current_consents AS
SELECT
    id,
    user_id,
    policy_type,
    policy_version,
    accepted,
    timestamp,
    consent_method,
    ip_address,
    notes
FROM consent_logs
WHERE is_current = true
  AND withdrawn_at IS NULL;

-- Grant SELECT on view to authenticated users for their own data
GRANT SELECT ON current_consents TO authenticated;

-- Comments for documentation
COMMENT ON TABLE consent_logs IS 'Tracks user consent to various policies for GDPR/CCPA compliance';
COMMENT ON COLUMN consent_logs.policy_type IS 'Type of policy (terms_of_service, privacy_policy, etc.)';
COMMENT ON COLUMN consent_logs.policy_version IS 'Version of policy that was accepted (e.g., 1.0, 1.1)';
COMMENT ON COLUMN consent_logs.is_current IS 'Marks the latest consent for this user/policy combination';
COMMENT ON COLUMN consent_logs.withdrawn_at IS 'Timestamp when user withdrew consent (GDPR right)';
COMMENT ON COLUMN consent_logs.parent_consent_id IS 'Links to previous consent for tracking policy updates';
COMMENT ON COLUMN consent_logs.consent_method IS 'How consent was obtained (signup_checkbox, popup, etc.)';
COMMENT ON COLUMN consent_logs.ip_address IS 'IP address at time of consent for audit trail';
COMMENT ON COLUMN consent_logs.user_agent IS 'Browser/device info at time of consent';

-- Sample query to get user's current consent status for all policies
-- SELECT policy_type, policy_version, timestamp, consent_method
-- FROM current_consents
-- WHERE user_id = '<user_id>';

-- Sample query to check if user has consented to specific policy
-- SELECT has_current_consent('<user_id>', 'terms_of_service', '1.0');
