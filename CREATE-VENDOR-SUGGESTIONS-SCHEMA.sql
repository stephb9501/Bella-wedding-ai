-- =====================================================
-- VENDOR-TO-VENDOR SUGGESTION SYSTEM
-- =====================================================
-- Allows vendors to suggest changes to each other's
-- timeline entries and counter-propose adjustments
-- =====================================================

-- Table for vendor suggestions and counter-proposals
CREATE TABLE IF NOT EXISTS timeline_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES vendor_bookings(id) ON DELETE CASCADE,

  -- Original timeline entry (or NULL if new suggestion)
  original_timeline_id UUID REFERENCES wedding_timeline(id) ON DELETE CASCADE,
  master_timeline_id UUID REFERENCES master_wedding_timeline(id) ON DELETE CASCADE,

  -- Who is suggesting
  suggesting_vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  suggesting_vendor_name VARCHAR(255),
  suggesting_vendor_category VARCHAR(100),

  -- Who needs to respond
  target_vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  target_vendor_name VARCHAR(255),
  target_vendor_category VARCHAR(100),

  -- Suggestion type
  suggestion_type VARCHAR(50) NOT NULL, -- new_entry, time_change, duration_change, location_change, full_edit

  -- Proposed changes
  proposed_time_slot TIME,
  proposed_activity VARCHAR(255),
  proposed_duration_minutes INTEGER,
  proposed_location VARCHAR(255),
  proposed_notes TEXT,

  -- Original values (for reference)
  current_time_slot TIME,
  current_activity VARCHAR(255),
  current_duration_minutes INTEGER,
  current_location VARCHAR(255),
  current_notes TEXT,

  -- Explanation
  reason TEXT,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, counter_proposed, rejected, withdrawn

  -- If counter-proposed, link to the counter
  counter_proposal_id UUID REFERENCES timeline_suggestions(id),

  -- Resolution
  resolved_by_vendor_id UUID REFERENCES vendors(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- History of suggestion conversations
CREATE TABLE IF NOT EXISTS suggestion_conversation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES timeline_suggestions(id) ON DELETE CASCADE,

  from_vendor_id UUID NOT NULL REFERENCES vendors(id),
  message TEXT NOT NULL,

  -- If this message includes a counter-proposal
  is_counter_proposal BOOLEAN DEFAULT false,
  proposed_changes JSONB, -- {time_slot, duration, etc.}

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to auto-create timeline when suggestion is accepted
CREATE OR REPLACE FUNCTION create_timeline_from_accepted_suggestion()
RETURNS TRIGGER AS $$
DECLARE
  project_id_var UUID;
BEGIN
  -- Only proceed if status changed to 'accepted'
  IF NEW.status = 'accepted' AND
     (OLD.status IS NULL OR OLD.status != 'accepted') THEN

    -- Get project_id from booking
    SELECT wp.id INTO project_id_var
    FROM wedding_projects wp
    WHERE wp.booking_id = NEW.booking_id
    LIMIT 1;

    -- If this is a new entry suggestion (no original_timeline_id)
    IF NEW.original_timeline_id IS NULL AND NEW.suggestion_type = 'new_entry' THEN

      -- Create new timeline entry for the target vendor
      INSERT INTO wedding_timeline (
        project_id,
        vendor_id,
        time_slot,
        activity,
        duration_minutes,
        location,
        notes,
        approval_status
      ) VALUES (
        project_id_var,
        NEW.target_vendor_id,
        NEW.proposed_time_slot,
        NEW.proposed_activity,
        NEW.proposed_duration_minutes,
        NEW.proposed_location,
        COALESCE(NEW.proposed_notes, '') ||
          E'\n\nSuggested by: ' || NEW.suggesting_vendor_name ||
          E'\nReason: ' || COALESCE(NEW.reason, ''),
        'draft' -- Target vendor can review and publish
      );

    -- If this is a modification suggestion
    ELSIF NEW.original_timeline_id IS NOT NULL THEN

      -- Update the original timeline entry
      UPDATE wedding_timeline
      SET
        time_slot = COALESCE(NEW.proposed_time_slot, time_slot),
        activity = COALESCE(NEW.proposed_activity, activity),
        duration_minutes = COALESCE(NEW.proposed_duration_minutes, duration_minutes),
        location = COALESCE(NEW.proposed_location, location),
        notes = COALESCE(notes || E'\n\nModified based on suggestion from: ' ||
                NEW.suggesting_vendor_name || E'\nReason: ' || COALESCE(NEW.reason, ''), notes),
        updated_at = NOW()
      WHERE id = NEW.original_timeline_id;

    END IF;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create/update timeline on acceptance
CREATE TRIGGER suggestion_acceptance_trigger
  AFTER UPDATE ON timeline_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION create_timeline_from_accepted_suggestion();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_timeline_suggestions_booking ON timeline_suggestions(booking_id);
CREATE INDEX IF NOT EXISTS idx_timeline_suggestions_status ON timeline_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_timeline_suggestions_suggesting_vendor ON timeline_suggestions(suggesting_vendor_id);
CREATE INDEX IF NOT EXISTS idx_timeline_suggestions_target_vendor ON timeline_suggestions(target_vendor_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_conversation_suggestion ON suggestion_conversation(suggestion_id);

-- RLS
ALTER TABLE timeline_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_conversation ENABLE ROW LEVEL SECURITY;

-- Vendors can view suggestions they're involved in
CREATE POLICY "Vendors can view their suggestions"
  ON timeline_suggestions FOR SELECT
  USING (suggesting_vendor_id = auth.uid() OR target_vendor_id = auth.uid());

-- Vendors can create suggestions
CREATE POLICY "Vendors can create suggestions"
  ON timeline_suggestions FOR INSERT
  WITH CHECK (suggesting_vendor_id = auth.uid());

-- Vendors can update suggestions they created or are targeted by
CREATE POLICY "Vendors can update their suggestions"
  ON timeline_suggestions FOR UPDATE
  USING (suggesting_vendor_id = auth.uid() OR target_vendor_id = auth.uid());

-- Conversation policies
CREATE POLICY "Vendors can view suggestion conversations"
  ON suggestion_conversation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM timeline_suggestions
      WHERE timeline_suggestions.id = suggestion_conversation.suggestion_id
      AND (timeline_suggestions.suggesting_vendor_id = auth.uid()
           OR timeline_suggestions.target_vendor_id = auth.uid())
    )
  );

CREATE POLICY "Vendors can add to conversations"
  ON suggestion_conversation FOR INSERT
  WITH CHECK (from_vendor_id = auth.uid());

-- Triggers
CREATE TRIGGER update_timeline_suggestions_updated_at
  BEFORE UPDATE ON timeline_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VENDOR-TO-VENDOR WORKFLOW EXAMPLES:
-- =====================================================

-- EXAMPLE 1: Planner suggests DJ arrival time
-- 1. Planner creates suggestion:
--    "DJ should arrive at 4:30 PM for 30-min setup"
--    → Creates timeline_suggestions record
--    → Status: pending
--    → DJ gets notification
--
-- 2. DJ reviews and can:
--    a) ACCEPT → Status: accepted
--       → Trigger creates timeline entry for DJ
--       → DJ can then publish to master
--
--    b) COUNTER-PROPOSE → "I need 45 minutes, start at 4:15 PM"
--       → Creates new suggestion with counter_proposal_id
--       → Planner gets notification
--       → Back-and-forth until agreed
--
--    c) REJECT → "Can't arrive before 5 PM due to another wedding"
--       → Status: rejected
--       → Planner sees reason, adjusts plan

-- EXAMPLE 2: DJ suggests change to existing entry
-- 1. Planner has timeline: "DJ Setup: 4:30-5:00 PM"
-- 2. DJ suggests: "Need to change to 4:15-5:00 PM"
--    → References original_timeline_id
--    → Status: pending
-- 3. Planner accepts
--    → Original timeline updated
--    → Both vendors see agreed time

-- EXAMPLE 3: Multi-vendor coordination
-- 1. Photographer suggests: "Need equipment at venue by 3 PM"
-- 2. Venue coordinator sees, accepts
-- 3. Auto-creates timeline entry for coordinator
-- 4. Coordinator publishes to master
-- 5. All vendors see: Equipment arrives at 3 PM

-- =====================================================
-- SUCCESS! Vendor-to-vendor suggestion system created!
-- =====================================================
-- Vendors can now:
-- - Suggest new timeline entries to each other
-- - Propose changes to existing entries
-- - Counter-propose adjustments
-- - Have back-and-forth conversations
-- - Auto-create entries when accepted
-- - All without bride involvement (unless publishing)
-- =====================================================
